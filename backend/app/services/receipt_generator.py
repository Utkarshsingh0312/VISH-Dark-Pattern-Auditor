"""
ReceiptGenerator — Assembles the chronological itemized audit receipt.

PPT Page 3 & 5:
"Itemized Receipt: Every point charged, and why, laid out in sequence."
"A lightweight web page rendering the itemized receipt and score live, reading straight from the Friction Engine's output."
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.schemas.audit import AuditResult, AuditStep, Detection, AuditType, DarkPatternType
from app.services.friction_engine import FrictionEngine

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ReceiptGenerator:
    @staticmethod
    def generate_receipt(
        audit_id: str,
        url: str,
        audit_type: AuditType,
        steps: List[AuditStep],
        detections: List[Detection],
        is_demo: bool = False,
        created_at: Optional[datetime] = None,
        vision_source: str = "gemini_vision"
    ) -> AuditResult:
        """
        Calculates final friction score using FrictionEngine and assembles
        the complete itemized compliance receipt.
        """
        # Deduplicate identical detections (same category and matching evidence across frames)
        unique_detections: List[Detection] = []
        seen_evidence = set()
        for d in detections:
            norm_key = (d.pattern_name.lower().strip(), d.evidence.lower().strip())
            if norm_key not in seen_evidence:
                seen_evidence.add(norm_key)
                unique_detections.append(d)

        score, est_cost, est_minutes = FrictionEngine.calculate_score(unique_detections)
        
        # Sort detections chronologically by step number
        sorted_detections = sorted(unique_detections, key=lambda d: d.step_number)

        source_label = "Gemini Vision AI" if vision_source == "gemini_vision" else "Mock Analysis"
        summary = (
            f"VISH audited {len(steps)} steps on {url}. "
            f"Analysis Source: {source_label}. "
            f"Detected {len(unique_detections)} dark patterns contributing to a total Friction Score of {score}/45. "
            f"Estimated consumer friction: ${est_cost:.2f} extra cost, {est_minutes} extra minutes lost."
        )

        return AuditResult(
            audit_id=audit_id,
            url=url,
            audit_type=audit_type,
            friction_score=score,
            detections=sorted_detections,
            estimated_cost=est_cost,
            estimated_time=est_minutes,
            steps=steps,
            created_at=created_at or utc_now(),
            completed_at=utc_now(),
            is_demo=is_demo,
            vision_source=vision_source,
            score_summary=summary
        )

    @staticmethod
    def generate_demo_receipt(flow_id: str = "dark_pattern_flow") -> AuditResult:
        """
        Generates demo receipts using PPT reference scores:
        - Known dark-pattern flow: 37 / 45
        - Honest / one-click flow: 6 / 45
        - Industry-average flow: 18 / 45
        """
        now = utc_now()
        if flow_id == "honest_flow":
            # PPT Page 8 calibration: 6
            detections = [
                Detection(
                    pattern_name="Minor Visual Prominence",
                    step_number=2,
                    description="Slightly enhanced styling on annual billing toggle over monthly option.",
                    evidence="Annual tier button has 2px highlight border; monthly pricing remains clearly readable.",
                    location="Plan selection grid",
                    score_contribution=6,
                    confidence=0.86,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                )
            ]
            steps = [
                AuditStep(step_number=1, url="https://honest-example.store/checkout", status="Completed"),
                AuditStep(step_number=2, url="https://honest-example.store/billing", status="Completed"),
                AuditStep(step_number=3, url="https://honest-example.store/review", status="Completed")
            ]
            res = ReceiptGenerator.generate_receipt(
                audit_id="demo_honest_flow",
                url="https://demo.honest-checkout.flow",
                audit_type=AuditType.CHECKOUT,
                steps=steps,
                detections=detections,
                is_demo=True,
                created_at=now,
                vision_source="demo"
            )
            res.friction_score = 6
            res.estimated_cost = 0.0
            res.estimated_time = 1
            return res

        elif flow_id == "industry_average_flow":
            # PPT Page 8 calibration: 18 (Stretch Goal)
            detections = [
                Detection(
                    pattern_name=DarkPatternType.HIDDEN_COST.value,
                    step_number=1,
                    description="Pre-checked express fee added before shipping review.",
                    evidence="Checkbox: 'Rush shipping insurance (+$2.50)' pre-selected by default.",
                    location="Shipping options form",
                    score_contribution=12,
                    confidence=0.89,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                ),
                Detection(
                    pattern_name="False Urgency",
                    step_number=2,
                    description="Standard inventory scarcity banner during cart review.",
                    evidence="Text: 'Only 3 left in stock — 14 people looking right now'.",
                    location="Cart header badge",
                    score_contribution=6,
                    confidence=0.91,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                )
            ]
            steps = [
                AuditStep(step_number=1, url="https://demo.industry-standard.shop/cart", status="Completed"),
                AuditStep(step_number=2, url="https://demo.industry-standard.shop/shipping", status="Completed"),
                AuditStep(step_number=3, url="https://demo.industry-standard.shop/payment", status="Completed")
            ]
            res = ReceiptGenerator.generate_receipt(
                audit_id="demo_industry_average",
                url="https://demo.industry-average.flow",
                audit_type=AuditType.CHECKOUT,
                steps=steps,
                detections=detections,
                is_demo=True,
                created_at=now,
                vision_source="demo"
            )
            res.friction_score = 18
            res.estimated_cost = 2.50
            res.estimated_time = 4
            return res

        elif flow_id == "blocked_challenge_flow":
            steps = [
                AuditStep(
                    step_number=1,
                    url="https://demo.security-challenge.verify/checkout",
                    title="Security Verification Required | Cloudflare",
                    action="Initial Page Navigation",
                    status="Blocked",
                    is_challenge=True,
                    screenshot="/api/mock_sites/security_challenge_fixture.html",
                    screenshot_url="/api/mock_sites/security_challenge_fixture.html",
                    timestamp=now
                )
            ]
            res = ReceiptGenerator.generate_blocked_receipt(
                audit_id="demo_blocked_challenge_flow",
                url="https://demo.security-challenge.verify/checkout",
                audit_type=AuditType.CHECKOUT,
                steps=steps,
                reason="The target website requires a security verification that VISH cannot bypass.",
                security_barrier="Cloudflare Turnstile",
                created_at=now
            )
            res.is_demo = True
            return res

        else:
            # PPT Page 8 calibration: 37 (Known dark-pattern flow)
            # Detections strictly from PPT Table Page 3
            detections = [
                Detection(
                    pattern_name=DarkPatternType.CONFIRMSHAMING.value,
                    step_number=1,
                    description="Coercive language on subscription decline button.",
                    evidence="'No thanks, I like paying full price'",
                    location="Bottom opt-out modal",
                    score_contribution=7,
                    confidence=0.92,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                ),
                Detection(
                    pattern_name=DarkPatternType.HIDDEN_COST.value,
                    step_number=2,
                    description="Reversible × monetary impact: Undisclosed fee revealed only at final confirmation.",
                    evidence="$4.99 fee shown only at final confirmation",
                    location="Order summary card",
                    score_contribution=12,
                    confidence=0.96,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                ),
                Detection(
                    pattern_name=DarkPatternType.FORCED_REAUTH.value,
                    step_number=3,
                    description="Adds friction after cost is shown: Password re-entry required after fee appears.",
                    evidence="Password re-entry required after the fee appears",
                    location="Checkout auth overlay",
                    score_contribution=8,
                    confidence=0.88,
                    needs_human_review=False,
                    analysis_source="demo",
                    is_real_ai=False
                ),
                Detection(
                    pattern_name=DarkPatternType.ROACH_MOTEL.value,
                    step_number=4,
                    description="Entry vs. exit effort asymmetry: One-click signup, phone-call-only cancellation.",
                    evidence="One-click signup, phone-call-only cancellation",
                    location="Subscription fine print",
                    score_contribution=10,
                    confidence=0.69,
                    needs_human_review=True,  # Low confidence (< 0.80) -> Human Review!
                    analysis_source="demo",
                    is_real_ai=False
                )
            ]
            steps = [
                AuditStep(step_number=1, url="https://demo.dark-pattern.store/plan", status="Completed"),
                AuditStep(step_number=2, url="https://demo.dark-pattern.store/upsell", status="Completed"),
                AuditStep(step_number=3, url="https://demo.dark-pattern.store/checkout", status="Completed"),
                AuditStep(step_number=4, url="https://demo.dark-pattern.store/reauth", status="Completed")
            ]
            res = ReceiptGenerator.generate_receipt(
                audit_id="demo_dark_pattern_flow",
                url="https://demo.dark-pattern-checkout.flow",
                audit_type=AuditType.CHECKOUT,
                steps=steps,
                detections=detections,
                is_demo=True,
                created_at=now,
                vision_source="demo"
            )
            # Total score = 7 + 12 + 8 + 10 = 37 (Exact PPT Page 8 calibration)
            res.friction_score = 37
            res.estimated_cost = 4.99
            res.estimated_time = 15
            return res

    @staticmethod
    def generate_blocked_receipt(
        audit_id: str,
        url: str,
        audit_type: AuditType,
        steps: List[AuditStep],
        reason: Optional[str] = None,
        security_barrier: Optional[str] = None,
        created_at: Optional[datetime] = None
    ) -> AuditResult:
        """
        Generates an audit receipt specifically when the target site presented
        an anti-bot or security verification challenge (e.g. Cloudflare Turnstile,
        reCAPTCHA, PerimeterX, HTTP 403 Forbidden).
        Guarantees:
        - friction_score is None (never 0/45).
        - score_summary: "VISH stopped safely because this website requires automated-access verification. We do not bypass security controls, so no unreliable score was generated."
        - Does NOT classify Audit Blocked as a TRUE NEGATIVE or clean.
        - Preserves captured step screenshots as visual blocked evidence.
        """
        standard_reason = reason or "The target website requires a security verification that VISH cannot bypass."
        summary = (
            "VISH stopped safely because this website requires automated-access verification. "
            "We do not bypass security controls, so no unreliable score was generated."
        )
        return AuditResult(
            audit_id=audit_id,
            url=url,
            audit_type=audit_type,
            friction_score=None,
            detections=[],
            estimated_cost=0.0,
            estimated_time=0,
            steps=steps,
            created_at=created_at or utc_now(),
            completed_at=utc_now(),
            is_demo=False,
            is_live_crawl=True,
            is_blocked=True,
            block_reason=standard_reason,
            security_barrier=security_barrier or "Automated Access Verification",
            vision_source="blocked",
            score_summary=summary
        )
