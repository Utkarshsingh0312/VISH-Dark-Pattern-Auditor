"""
FrictionEngine — Core scoring engine for VISH (Dark Pattern Auditor).

Primary Source of Truth: VISH Presentation (PPT Page 3 & 8).
Scale: Strictly 0–45.
Rolls back up into estimated dollars and minutes lost.

SCORING METHODOLOGY (PPT Page 3):
- Hidden Cost: Weight Basis = Reversible × monetary impact
  Example: $4.99 fee shown only at final confirmation
- Forced Re-auth: Weight Basis = Adds friction after cost is shown
  Example: Password re-entry required after the fee appears
- Confirmshaming: Weight Basis = Coercive language on decline path
  Example: "No thanks, I like paying full price"
- Roach Motel: Weight Basis = Entry vs. exit effort asymmetry
  Example: One-click signup, phone-call-only cancellation
"""

import re
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.audit import Detection, DarkPatternType

logger = logging.getLogger("vish.friction_engine")

class FrictionEngine:
    """
    Authoritative calculation engine for VISH Friction Scores (0–45 scale).
    """

    MAX_SCORE = 45
    MIN_SCORE = 0

    # Published Methodology Table from PPT Page 3
    RUBRIC_METHODOLOGY: Dict[str, Dict[str, Any]] = {
        DarkPatternType.HIDDEN_COST.value: {
            "weight_basis": "Reversible × monetary impact",
            "ppt_example": "$4.99 fee shown only at final confirmation",
            "default_points": 12,
            "est_minute_impact": 2
        },
        DarkPatternType.FORCED_REAUTH.value: {
            "weight_basis": "Adds friction after cost is shown",
            "ppt_example": "Password re-entry required after the fee appears",
            "default_points": 8,
            "est_minute_impact": 3
        },
        DarkPatternType.CONFIRMSHAMING.value: {
            "weight_basis": "Coercive language on decline path",
            "ppt_example": "'No thanks, I like paying full price'",
            "default_points": 7,
            "est_minute_impact": 2
        },
        DarkPatternType.ROACH_MOTEL.value: {
            "weight_basis": "Entry vs. exit effort asymmetry",
            "ppt_example": "One-click signup, phone-call-only cancellation",
            "default_points": 10,
            "est_minute_impact": 8
        }
    }

    @classmethod
    def score_detection(cls, pattern_name: str, evidence: str = "", description: str = "") -> int:
        """
        Determines the score contribution for a detected dark pattern
        based on the PPT published weight basis.
        """
        norm_name = pattern_name.strip()
        
        # Match against supported PPT categories
        matched_category = None
        for cat in cls.RUBRIC_METHODOLOGY:
            if cat.lower() in norm_name.lower():
                matched_category = cat
                break

        if not matched_category:
            logger.warning(f"[FrictionEngine] Pattern '{pattern_name}' is not one of the 4 PPT categories. Score contribution: 0.")
            return 0

        rule = cls.RUBRIC_METHODOLOGY[matched_category]
        base_points = rule["default_points"]

        # If evidence reveals a specific monetary impact for Hidden Cost
        if matched_category == DarkPatternType.HIDDEN_COST.value:
            # Check for monetary amounts in evidence (e.g. $4.99, $10, etc.)
            dollar_match = re.search(r"\$(\d+(?:\.\d{2})?)", evidence + " " + description)
            if dollar_match:
                fee = float(dollar_match.group(1))
                if fee >= 10.0:
                    return 15
                elif fee >= 4.0:
                    return 12
                else:
                    return 10
            return base_points

        return base_points

    @classmethod
    def calculate_score(cls, detections: List[Detection]) -> Tuple[int, float, int]:
        """
        Calculates total friction score (0–45), estimated extra dollars lost,
        and estimated extra minutes lost from a list of detections.
        """
        if not detections:
            return 0, 0.0, 0

        raw_score = 0
        total_dollars = 0.0
        total_minutes = 0

        for d in detections:
            # Score contribution determined by PPT rubric
            points = cls.score_detection(d.pattern_name, d.evidence, d.description)
            d.score_contribution = points
            raw_score += points

            # Extract monetary impact from Hidden Cost
            if DarkPatternType.HIDDEN_COST.value.lower() in d.pattern_name.lower():
                dollar_match = re.search(r"\$(\d+(?:\.\d{2})?)", d.evidence + " " + d.description)
                if dollar_match:
                    total_dollars += float(dollar_match.group(1))
                else:
                    total_dollars += 4.99  # Standard PPT reference fee

            # Calculate minute impact based on weight basis
            for cat, rule in cls.RUBRIC_METHODOLOGY.items():
                if cat.lower() in d.pattern_name.lower():
                    total_minutes += rule["est_minute_impact"]
                    break

        # Final score strictly constrained to 0–45 (PPT scale)
        final_score = max(cls.MIN_SCORE, min(cls.MAX_SCORE, raw_score))
        return final_score, round(total_dollars, 2), total_minutes

    @classmethod
    def get_rubric_documentation(cls) -> Dict[str, Any]:
        """Returns the published fixed rubric methodology from PPT Page 3."""
        return {
            "name": "VISH Published Friction Score Rubric",
            "scale": "0–45",
            "source": "PPT Page 3 (A Number, Not a Feeling)",
            "categories": cls.RUBRIC_METHODOLOGY
        }
