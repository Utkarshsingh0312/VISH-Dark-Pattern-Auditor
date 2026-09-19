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
