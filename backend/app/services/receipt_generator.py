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
        score, est_cost, est_minutes = FrictionEngine.calculate_score(detections)
        
        # Sort detections chronologically by step number
        sorted_detections = sorted(detections, key=lambda d: d.step_number)

        source_label = "Gemini Vision AI" if vision_source == "gemini_vision" else "Mock Analysis"
        summary = (
            f"VISH audited {len(steps)} steps on {url}. "
            f"Analysis Source: {source_label}. "
            f"Detected {len(detections)} dark patterns contributing to a total Friction Score of {score}/45. "
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
