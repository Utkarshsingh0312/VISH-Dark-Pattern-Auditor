"""
VISH Friction Engine
Calculates standardized Friction Score (0-45), itemized receipt, and impact metrics.
Based on the published dark pattern scoring methodology.
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field

class DarkPatternItem(BaseModel):
    pattern_id: str
    pattern_name: str
    step_number: int
    step_title: str
    description: str
    weight_basis: str
    penalty_points: float
    monetary_impact: float = 0.0
    time_impact_min: float = 0.0
    screenshot_url: str = ""
    evidence_snippet: str = ""
    confidence: float = 1.0

class AuditReceipt(BaseModel):
    audit_id: str
    url: str
    timestamp: str
    total_friction_score: float  # Clamped between 0 and 45
    raw_friction_score: float
    industry_average_score: float = 18.0
    honest_benchmark_score: float = 6.0
    estimated_dollars_lost: float
    estimated_minutes_wasted: float
    patterns_found_count: int
    total_screens_audited: int
    items: List[DarkPatternItem]
    verdict: str

# Standard Rubric Definition
TAXONOMY_RUBRIC = {
    "hidden_cost": {
        "name": "Hidden Cost",
        "weight_basis": "Reversible × monetary impact ($ added at final confirmation)",
        "base_points": 10.0,
        "default_monetary": 4.99,
        "default_time": 2.5
    },
    "forced_reauth": {
        "name": "Forced Re-auth",
        "weight_basis": "Adds artificial friction after cost is shown",
        "base_points": 7.0,
        "default_monetary": 0.0,
        "default_time": 3.0
    },
    "confirmshaming": {
        "name": "Confirmshaming",
        "weight_basis": "Coercive/guilt language on decline path",
        "base_points": 6.0,
        "default_monetary": 0.0,
        "default_time": 1.0
    },
    "roach_motel": {
        "name": "Roach Motel",
        "weight_basis": "Entry vs. exit effort asymmetry (hard cancellation / multi-step drop)",
        "base_points": 12.0,
        "default_monetary": 0.0,
        "default_time": 6.0
    },
    "preselected_addon": {
        "name": "Pre-selected Add-on",
        "weight_basis": "Auto-checked opt-in items without user explicit choice",
        "base_points": 5.0,
        "default_monetary": 2.99,
        "default_time": 1.0
    },
    "false_urgency": {
        "name": "False Urgency",
        "weight_basis": "Artificial countdowns or deceptive pressure indicators",
        "base_points": 4.0,
        "default_monetary": 0.0,
        "default_time": 1.5
    }
}

class FrictionEngine:
    @staticmethod
    def compute_receipt(audit_id: str, url: str, timestamp: str, raw_findings: List[Dict[str, Any]], total_screens: int) -> AuditReceipt:
        items: List[DarkPatternItem] = []
        raw_score = 0.0
        total_dollars = 0.0
        total_minutes = 0.0

        for finding in raw_findings:
            pattern_key = finding.get("pattern_id", "").lower().replace("-", "_")
            rubric = TAXONOMY_RUBRIC.get(pattern_key, {
                "name": finding.get("pattern_name", "Uncategorized Manipulation"),
                "weight_basis": "Detected dark pattern friction",
                "base_points": 5.0,
                "default_monetary": finding.get("monetary_impact", 0.0),
                "default_time": 1.0
            })

            confidence = float(finding.get("confidence", 0.9))
            points = float(finding.get("penalty_points", rubric["base_points"])) * confidence
            monetary = float(finding.get("monetary_impact", rubric["default_monetary"]))
            time_wasted = float(finding.get("time_impact_min", rubric["default_time"]))

            item = DarkPatternItem(
                pattern_id=pattern_key,
                pattern_name=rubric["name"],
                step_number=finding.get("step_number", 1),
                step_title=finding.get("step_title", f"Step {finding.get('step_number', 1)}"),
                description=finding.get("description", "Dark pattern detected on page step."),
                weight_basis=rubric["weight_basis"],
                penalty_points=round(points, 1),
                monetary_impact=round(monetary, 2),
                time_impact_min=round(time_wasted, 1),
                screenshot_url=finding.get("screenshot_url", ""),
                evidence_snippet=finding.get("evidence_snippet", ""),
                confidence=round(confidence, 2)
            )

            items.append(item)
            raw_score += item.penalty_points
            total_dollars += item.monetary_impact
            total_minutes += item.time_impact_min

        # Friction score capped between 0 and 45 as defined in VISH published rubric
        final_friction_score = round(min(45.0, max(0.0, raw_score)), 1)

        # Determine verdict text based on score
        if final_friction_score <= 10:
            verdict = "HONEST & TRANSPARENT FLOW (Low Friction)"
        elif final_friction_score <= 25:
            verdict = "MODERATE MANIPULATION (Industry Average)"
        else:
            verdict = "HIGH DARK-PATTERN MANIPULATION (Severe Friction)"

        return AuditReceipt(
            audit_id=audit_id,
            url=url,
            timestamp=timestamp,
            total_friction_score=final_friction_score,
            raw_friction_score=round(raw_score, 1),
            industry_average_score=18.0,
            honest_benchmark_score=6.0,
            estimated_dollars_lost=round(total_dollars, 2),
            estimated_minutes_wasted=round(total_minutes, 1),
            patterns_found_count=len(items),
            total_screens_audited=total_screens,
            items=items,
            verdict=verdict
        )
