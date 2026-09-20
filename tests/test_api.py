import os
import json
import asyncio
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.services.friction_engine import FrictionEngine
from app.services.receipt_generator import ReceiptGenerator
from app.services.browser_agent import BrowserAgent, validate_url, InvalidUrlError
from app.services.vision_analyzer import VisionAnalyzer
from app.schemas.audit import Detection, DarkPatternType

client = TestClient(app)

# ----------------- Step 1 & 2 Regression Tests -----------------

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "VISH" in data["service"]
    assert len(data["supported_categories"]) == 4

def test_root_health_check():
    """Verify lightweight root /health endpoint for Railway / orchestrators."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "VISH" in data["service"]

def test_friction_engine_scale_limit():
    """Verify FrictionEngine caps maximum score at 45 per PPT rubric."""
    detections = [
        Detection(
            pattern_name="Hidden Cost",
            step_number=1,
            description="Fee 1",
            evidence="$15.00 undisclosed fee",
            score_contribution=0,
            confidence=0.9
        ),
        Detection(
            pattern_name="Hidden Cost",
            step_number=2,
            description="Fee 2",
            evidence="$15.00 undisclosed fee",
            score_contribution=0,
            confidence=0.9
        ),
        Detection(
            pattern_name="Roach Motel",
            step_number=3,
            description="Asymmetry",
            evidence="One-click subscribe, call to cancel",
            score_contribution=0,
            confidence=0.9
        ),
        Detection(
            pattern_name="Roach Motel",
            step_number=4,
            description="Asymmetry 2",
            evidence="Phone call only",
            score_contribution=0,
            confidence=0.9
        )
    ]
    # Sum = 15 + 15 + 10 + 10 = 50 -> must cap at 45
    score, cost, minutes = FrictionEngine.calculate_score(detections)
    assert score == 45

def test_demo_receipts_calibration():
    """Verify PPT reference scores (37, 6, 18)."""
    dark = ReceiptGenerator.generate_demo_receipt("dark_pattern_flow")
    assert dark.friction_score == 37
    assert len(dark.detections) == 4
    assert dark.vision_source == "demo"

    honest = ReceiptGenerator.generate_demo_receipt("honest_flow")
    assert honest.friction_score == 6
    assert honest.vision_source == "demo"

    avg = ReceiptGenerator.generate_demo_receipt("industry_average_flow")
    assert avg.friction_score == 18
    assert avg.vision_source == "demo"

def test_create_demo_audit():
    response = client.post(
        "/api/audits",
        json={
            "url": "https://demo.dark-pattern-checkout.flow",
            "audit_type": "Checkout",
            "is_demo": True,
            "demo_flow_id": "dark_pattern_flow"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "demo_dark_pattern_flow"
    assert data["friction_score"] == 37

def test_get_comparison():
    response = client.get("/api/comparison")
    assert response.status_code == 200
    data = response.json()
    assert len(data["benchmarks"]) == 3
    scores = {b["id"]: b["score"] for b in data["benchmarks"]}
    assert scores["dark_pattern"] == 37
    assert scores["honest"] == 6
    assert scores["industry_average"] == 18

def test_get_audit_results():
    response = client.get("/api/audits/demo_dark_pattern_flow/results")
    assert response.status_code == 200
    data = response.json()
    assert data["friction_score"] == 37
    assert data["estimated_cost"] == 4.99
    assert len(data["detections"]) == 4

def test_url_validation_valid():
    assert validate_url("https://example.com") == "https://example.com"
    assert validate_url("http://shop.example.org/checkout") == "http://shop.example.org/checkout"
    assert validate_url("  https://google.com/  ") == "https://google.com/"

def test_url_validation_invalid_schemes():
    with pytest.raises(InvalidUrlError, match="Unsupported scheme"):
        validate_url("javascript:alert(1)")
    with pytest.raises(InvalidUrlError, match="Unsupported scheme"):
        validate_url("file:///etc/passwd")
    with pytest.raises(InvalidUrlError, match="Unsupported scheme"):
        validate_url("data:text/html,<h1>test</h1>")
    with pytest.raises(InvalidUrlError, match="Unsupported scheme"):
        validate_url("chrome://settings")

def test_url_validation_empty_and_malformed():
    with pytest.raises(InvalidUrlError):
        validate_url("")
    with pytest.raises(InvalidUrlError):
        validate_url("   ")
    with pytest.raises(InvalidUrlError):
        validate_url("not-a-valid-url")

def test_api_rejects_invalid_url():
    response = client.post(
        "/api/audits",
        json={
            "url": "javascript:alert('pwn')",
            "audit_type": "Signup",
            "is_demo": False
        }
    )
    assert response.status_code == 400
    assert "Unsupported scheme" in response.json()["detail"]

def test_payment_safety_heuristic():
    agent = BrowserAgent()
    assert any(term in "click here to place order" for term in agent.PAYMENT_KEYWORDS)
    assert any(term in "confirm purchase now" for term in agent.PAYMENT_KEYWORDS)
    assert any(term in "pay now with card" for term in agent.PAYMENT_KEYWORDS)

def test_playwright_browser_agent_lifecycle(tmp_path):
    async def run_test():
        agent = BrowserAgent(
            headless=True,
            screenshots_dir=str(tmp_path),
            pacing_delay_sec=0.1,
            max_pages=2
        )
        try:
            init_res = await agent.start_audit("https://example.com", audit_id="test_pw_audit")
            assert init_res["audit_id"] == "test_pw_audit"
            assert "Example Domain" in init_res["current_title"]
            assert len(agent.steps) == 1
            first_step = agent.steps[0]
            assert first_step.screenshot is not None
            assert Path(first_step.screenshot).exists()
            safety_stop = agent.stop_before_payment("Testing safety guard")
            assert safety_stop["stopped_for_safety"] is True
            assert agent.stopped_for_safety is True
        finally:
            await agent.close()
    asyncio.run(run_test())

def test_payment_safety_dom_detection(tmp_path):
    async def run_test():
        agent = BrowserAgent(
            headless=True,
            screenshots_dir=str(tmp_path),
            pacing_delay_sec=0.1
        )
        try:
            await agent.start_audit("https://example.com", audit_id="test_safety_dom")
            await agent._page.evaluate(
                "document.body.innerHTML += '<button id=\"pay-btn\">Place Order & Pay $49.99</button>';"
            )
            is_payment, trigger = await agent.check_payment_safety()
            assert is_payment is True
            agent.stop_before_payment(reason=f"Detected trigger: {trigger}")
            assert agent.stopped_for_safety is True
            assert agent.payment_detected is True
        finally:
            await agent.close()
    asyncio.run(run_test())

def test_payment_safety_distinguishes_confirmshaming_and_marketing_copy(tmp_path):
    """Verify Confirmshaming decline text, 'pay later', and comparative copy do not falsely trigger payment stops, but real payment controls do."""
    async def run_test():
        agent = BrowserAgent(
            headless=True,
            screenshots_dir=str(tmp_path),
            pacing_delay_sec=0.1
        )
        try:
            await agent.start_audit("https://example.com", audit_id="test_safety_non_payment")
            
            # Inject non-transactional confirmshaming decline links and promotional copy
            await agent._page.evaluate("""
                document.body.innerHTML = `
                    <div id="modal">
                        <h2>15% Off Your Order</h2>
                        <button id="claim-btn">Claim the Discount</button>
                        <a href="#" id="decline-link">No, Thanks! I'll pay full price.</a>
                        <button id="decline-btn">No thanks, I like paying full price</button>
                        <p>Why pay more? Pay later with Klarna available.</p>
                    </div>
                `;
            """)
            is_payment, trigger = await agent.check_payment_safety()
            assert is_payment is False, f"Expected False for decline copy, but got True with trigger '{trigger}'"
            assert agent.stopped_for_safety is False
            assert agent.payment_detected is False

            # Now add a genuine payment button
            await agent._page.evaluate("""
                document.body.innerHTML += '<button id="real-checkout">Submit Payment</button>';
            """)
            is_payment_real, trigger_real = await agent.check_payment_safety()
            assert is_payment_real is True
            assert "submit payment" in trigger_real.lower()

            # Now test direct amount payment button (e.g. "Pay $15.00")
            await agent._page.evaluate("""
                document.body.innerHTML = '<button id="pay-amt-btn">Pay $15.00</button>';
            """)
            is_payment_amt, trigger_amt = await agent.check_payment_safety()
            assert is_payment_amt is True
            assert "pay $" in trigger_amt.lower()
        finally:
            await agent.close()
    asyncio.run(run_test())

# ----------------- Step 3 Gemini Vision & Scoring Tests -----------------

def test_gemini_response_parsing_valid():
    """Verify VisionAnalyzer parses structured JSON with What, Where, Why, and Evidence."""
    analyzer = VisionAnalyzer()
    sample_json = json.dumps({
        "detections": [
            {
                "pattern_name": "Hidden Cost",
                "description": "Fee appears only at final confirmation screen.",
                "evidence": "$4.99 processing fee added to subtotal",
                "location": "Bottom checkout summary card",
                "confidence": 0.94
            }
        ]
    })
    
    detections = analyzer.parse_gemini_response(sample_json, step_number=2)
    assert len(detections) == 1
    d = detections[0]
    assert d.pattern_name == "Hidden Cost"
    assert d.step_number == 2
    assert d.location == "Bottom checkout summary card"
    assert "$4.99" in d.evidence
    assert d.confidence == 0.94
    assert d.needs_human_review is False
    assert d.score_contribution > 0

def test_gemini_markdown_fence_extraction():
    """Verify VisionAnalyzer extracts JSON from markdown ```json ``` blocks."""
    analyzer = VisionAnalyzer()
    markdown_wrapped = """Here is the audit result:
```json
{
  "detections": [
    {
      "pattern_name": "Confirmshaming",
      "description": "Manipulative decline button wording.",
      "evidence": "No thanks, I like paying full price",
      "location": "Modal footer",
      "confidence": 0.88
    }
  ]
}
```
Hope this helps!"""
    
    detections = analyzer.parse_gemini_response(markdown_wrapped, step_number=1)
    assert len(detections) == 1
    assert detections[0].pattern_name == "Confirmshaming"
    assert detections[0].confidence == 0.88

def test_gemini_category_filtering():
    """Verify VisionAnalyzer strictly restricts detections to the 4 PPT categories."""
    analyzer = VisionAnalyzer()
    unsupported_json = json.dumps({
        "detections": [
            {
                "pattern_name": "Fake Urgency Countdown",
                "description": "Not in PPT 4 categories",
                "evidence": "5 mins left",
                "confidence": 0.9
            },
            {
                "pattern_name": "Roach Motel",
                "description": "One-click signup, phone-call-only cancellation",
                "evidence": "Call 1-800 to cancel",
                "location": "Footer terms",
                "confidence": 0.85
            }
        ]
    })
    
    detections = analyzer.parse_gemini_response(unsupported_json, step_number=3)
    # The unsupported category must be discarded; only Roach Motel retained
    assert len(detections) == 1
    assert detections[0].pattern_name == "Roach Motel"

def test_gemini_confidence_threshold_and_human_review():
    """Verify confidence below 0.80 triggers needs_human_review = True."""
    analyzer = VisionAnalyzer(confidence_threshold=0.80)
    
    # High confidence (0.91)
    high_conf_json = json.dumps({
        "detections": [{
            "pattern_name": "Forced Re-auth",
            "description": "Password re-entry required after fee appears",
            "evidence": "Password re-entry prompt",
            "confidence": 0.91
        }]
    })
    d_high = analyzer.parse_gemini_response(high_conf_json)[0]
    assert d_high.needs_human_review is False

    # Low confidence (0.65)
    low_conf_json = json.dumps({
        "detections": [{
            "pattern_name": "Forced Re-auth",
            "description": "Possible re-auth screen",
            "evidence": "Vague login box",
            "confidence": 0.65
        }]
    })
    d_low = analyzer.parse_gemini_response(low_conf_json)[0]
    assert d_low.needs_human_review is True

def test_friction_engine_authoritative_scoring():
    """Verify FrictionEngine calculates score contribution based on PPT methodology."""
    # Vision Analyzer passes detection with default 0 contribution
    det = Detection(
        pattern_name="Hidden Cost",
        step_number=1,
        description="Fee shown only at final confirmation",
        evidence="$4.99 fee shown only at final confirmation",
        location="Summary box",
        score_contribution=0,
        confidence=0.95
    )
    score, cost, minutes = FrictionEngine.calculate_score([det])
    assert score == 12  # PPT Hidden Cost base weight
    assert cost == 4.99
    assert minutes > 0
    assert det.score_contribution == 12

def test_gemini_malformed_response_resilience():
    """Verify that malformed or non-JSON responses do not crash the parser."""
    analyzer = VisionAnalyzer()
    assert analyzer.parse_gemini_response("") == []
    assert analyzer.parse_gemini_response("This is not JSON at all") == []
    assert analyzer.parse_gemini_response("{detections: broken syntax") == []
    assert analyzer.parse_gemini_response('{"detections": []}') == []

def test_cors_vercel_and_local_origins():
    """Verify CORS middleware allows Vercel origins (*.vercel.app) and local dev origins."""
    for origin in [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vish-frontend.vercel.app",
        "https://vish-dark-pattern-auditor.vercel.app",
        "https://preview-123.vercel.app"
    ]:
        res = client.get("/health", headers={"Origin": origin})
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == origin

        preflight = client.options(
            "/api/audits",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        assert preflight.status_code == 200
        assert preflight.headers.get("access-control-allow-origin") == origin
        assert preflight.headers.get("access-control-allow-credentials") == "true"


def test_generate_blocked_receipt():
    """Verify ReceiptGenerator produces compliant blocked receipt without certifying 0/45."""
    receipt = ReceiptGenerator.generate_blocked_receipt(
        audit_id="audit_test_blocked",
        url="https://www.agoda.com",
        audit_type="Checkout",
        steps=[],
        reason="The target website requires a security verification that VISH cannot bypass.",
        security_barrier="Cloudflare Turnstile"
    )
    assert receipt.audit_id == "audit_test_blocked"
    assert receipt.is_blocked is True
    assert receipt.vision_source == "blocked"
    assert receipt.friction_score is None  # Never 0/45
    assert len(receipt.detections) == 0
    assert "VISH stopped safely because this website requires automated-access verification" in receipt.score_summary
    assert "We do not bypass security controls" in receipt.score_summary
    assert receipt.block_reason == "The target website requires a security verification that VISH cannot bypass."
    assert receipt.security_barrier == "Cloudflare Turnstile"


def test_anti_bot_challenge_detection_on_fixture(tmp_path):
    """Verify BrowserAgent conservatively identifies anti-bot challenge and sets status to Audit Blocked."""
    fixture_path = Path("backend/mock_sites/security_challenge_fixture.html").resolve()
    assert fixture_path.exists(), f"Fixture missing at {fixture_path}"
    fixture_html = fixture_path.read_text(encoding="utf-8")

    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.1, screenshots_dir=tmp_path)
        try:
            await agent.start_audit("https://example.com", "test_challenge_audit")
            # Replace page content with anti-bot challenge fixture
            await agent._page.set_content(fixture_html)

            # Test direct check_security_challenge
            is_challenge, reason = await agent.check_security_challenge()
            assert is_challenge is True
            assert "human" in reason.lower() or "challenge" in reason.lower()
            assert "turnstile" in agent.security_barrier.lower() or "cloudflare" in agent.security_barrier.lower()

            # Test run_controlled_audit identifies challenge and halts
            steps = await agent.run_controlled_audit()
            assert agent.is_blocked is True
            assert agent.status == "Audit Blocked"
            assert agent.block_reason == "The target website requires a security verification that VISH cannot bypass."
            assert any(s.is_challenge for s in steps)
            assert steps[-1].status == "Blocked"
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_perimeterx_challenge_detection(tmp_path):
    """Verify BrowserAgent detects PerimeterX #px-captcha and halts with AUDIT BLOCKED."""
    fixture_path = Path("backend/mock_sites/perimeterx_fixture.html").resolve()
    assert fixture_path.exists(), f"PerimeterX fixture missing at {fixture_path}"
    fixture_html = fixture_path.read_text(encoding="utf-8")

    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path)
        try:
            await agent.start_audit("https://example.com", "test_px_audit")
            await agent._page.set_content(fixture_html)

            is_challenge, reason = await agent.check_security_challenge()
            assert is_challenge is True
            assert agent.security_barrier == "PerimeterX / Bot Detection"

            steps = await agent.run_controlled_audit()
            assert agent.is_blocked is True
            assert agent.block_reason == "The target website requires a security verification that VISH cannot bypass."
            assert steps[-1].status == "Blocked"
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_http_403_waf_challenge_detection(tmp_path):
    """Verify check_security_challenge identifies HTTP 403 Forbidden responses as automated access protection."""
    class MockResponse:
        def __init__(self, status):
            self.status = status

    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path)
        try:
            is_challenge, reason = await agent.check_security_challenge(response=MockResponse(403))
            assert is_challenge is True
            assert "403" in reason
            assert agent.security_barrier == "HTTP 403 (Automated Access / WAF Protection)"
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_blocked_demo_flow_api():
    """Verify POST /api/audits with blocked_challenge_flow returns valid blocked demo."""
    response = client.post(
        "/api/audits",
        json={
            "url": "https://demo.security-challenge.verify/checkout",
            "audit_type": "Checkout",
            "is_demo": True,
            "demo_flow_id": "blocked_challenge_flow"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Audit Blocked"
    assert data["is_blocked"] is True
    assert data["friction_score"] is None
    assert data["block_reason"] == "The target website requires a security verification that VISH cannot bypass."
    assert data["security_barrier"] == "Cloudflare Turnstile"

    # Fetch results
    results_resp = client.get(f"/api/audits/{data['id']}/results")
    assert results_resp.status_code == 200
    res = results_resp.json()
    assert res["is_blocked"] is True
    assert res["friction_score"] is None
    assert len(res["detections"]) == 0
    assert "We do not bypass security controls" in res["score_summary"]


def test_action_deduplication(tmp_path):
    """Verify BrowserAgent deduplicates actions and never repeats the same interaction."""
    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path)
        try:
            await agent.start_audit("https://example.com", "test_dedup_audit")
            await agent._page.set_content("""
                <div>
                    <button id="signup-btn">Sign Up Free</button>
                    <button id="search-btn">Search Deals</button>
                </div>
            """)
            el1, desc1 = await agent._find_next_safe_action()
            assert el1 is not None
            assert "signup-btn" in desc1 or "Sign Up" in desc1
            assert len(agent.performed_actions) == 1

            # Second call must NOT pick the first button again
            el2, desc2 = await agent._find_next_safe_action()
            assert el2 is not None
            assert "search-btn" in desc2 or "Search" in desc2
            assert len(agent.performed_actions) == 2
            assert desc1 != desc2

            # Third call has no remaining actions
            el3, desc3 = await agent._find_next_safe_action()
            assert el3 is None
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_prioritized_meaningful_flow_traversal(tmp_path):
    """Verify BrowserAgent prioritizes Signup (Tier 1) over Search (Tier 2) over Generic (Tier 7)."""
    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path)
        try:
            await agent.start_audit("https://example.com", "test_prio_audit")
            await agent._page.set_content("""
                <div>
                    <a href="/generic-info">Learn More</a>
                    <button id="search-hotels">Search Hotels</button>
                    <button id="create-acc">Create Account</button>
                </div>
            """)
            el1, desc1 = await agent._find_next_safe_action()
            # Tier 1 (Signup) must be chosen first
            assert "[1_SIGNUP]" in desc1
            assert "Create Account" in desc1

            el2, desc2 = await agent._find_next_safe_action()
            # Tier 2 (Search) must be chosen second
            assert "[2_SEARCH]" in desc2
            assert "Search Hotels" in desc2

            el3, desc3 = await agent._find_next_safe_action()
            # Tier 7 (Other/Benign) chosen last
            assert "[7_OTHER_BENIGN]" in desc3
            assert "Learn More" in desc3
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_payment_stop_behavior_and_no_purchase_submission(tmp_path):
    """Verify BrowserAgent detects checkout payment elements, halts safely, and never submits purchase."""
    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path, max_pages=3)
        try:
            await agent.start_audit("https://example.com", "test_pay_stop_audit")
            # Inject credit card input and final purchase confirmation button
            await agent._page.set_content("""
                <div>
                    <h2>Checkout Review</h2>
                    <input name="cardnumber" placeholder="Card Number" />
                    <button id="pay-submit" onclick="window.purchaseSubmitted = true;">Place Order & Pay Now</button>
                </div>
            """)
            is_payment, trigger = await agent.check_payment_safety()
            assert is_payment is True
            assert "Place Order" in trigger or "cardnumber" in trigger or "pay now" in trigger.lower()

            # Execute controlled crawl; it must halt immediately at the payment boundary
            steps = await agent.run_controlled_audit()
            assert agent.stopped_for_safety is True
            assert agent.payment_detected is True
            assert any(s.stopped_for_safety for s in steps)
            assert any("Safety Stop" in s.action for s in steps)

            # Confirm no purchase button was ever clicked in recorded actions
            assert not any("click" in s.action.lower() and "pay" in s.action.lower() for s in steps)
            assert steps[-1].screenshot is not None
            assert Path(steps[-1].screenshot).exists()
        finally:
            await agent.close()

    asyncio.run(run_test())


def test_screenshot_capture_after_interaction(tmp_path):
    """Verify screenshot file is created and metadata correctly recorded after each step."""
    async def run_test():
        agent = BrowserAgent(headless=True, pacing_delay_sec=0.05, screenshots_dir=tmp_path, max_pages=2)
        try:
            await agent.start_audit("https://example.com", "test_screen_audit")
            await agent._page.set_content("""
                <div>
                    <h1>Welcome</h1>
                    <a href="/catalog">Browse Catalog</a>
                </div>
            """)
            steps = await agent.run_controlled_audit()
            assert len(steps) >= 1
            for s in steps:
                assert s.screenshot is not None
                assert Path(s.screenshot).exists()
                assert Path(s.screenshot).stat().st_size > 0
                assert s.url is not None
                assert s.step_number >= 1
        finally:
            await agent.close()

    asyncio.run(run_test())


