"""
Unit tests for VISH Dark Pattern Auditor
Tests FrictionEngine scoring, Vision-LLM heuristic fallback, and API models.
"""

import os
import pytest
from friction_engine import FrictionEngine, AuditReceipt
from vision_classifier import VisionLLMClassifier

def test_friction_engine_scoring():
    raw_findings = [
        {
            "pattern_id": "hidden_cost",
            "pattern_name": "Hidden Cost",
            "step_number": 3,
            "description": "Unannounced $4.99 processing fee.",
            "monetary_impact": 4.99,
            "penalty_points": 10.0,
            "confidence": 1.0
        },
        {
            "pattern_id": "confirmshaming",
            "pattern_name": "Confirmshaming",
            "step_number": 2,
            "description": "Guilt-inducing opt-out button text.",
            "monetary_impact": 0.0,
            "penalty_points": 6.0,
            "confidence": 1.0
        },
        {
            "pattern_id": "roach_motel",
            "pattern_name": "Roach Motel",
            "step_number": 3,
            "description": "Asymmetric entry vs exit effort.",
            "monetary_impact": 0.0,
            "penalty_points": 12.0,
            "confidence": 1.0
        }
    ]

    receipt = FrictionEngine.compute_receipt(
        audit_id="test1234",
        url="http://127.0.0.1:8000/mock/evil_cart.html",
        timestamp="2026-09-14 22:30:00",
        raw_findings=raw_findings,
        total_screens=3
    )

    assert receipt.audit_id == "test1234"
    assert receipt.patterns_found_count == 3
    assert receipt.total_friction_score == 28.0  # 10 + 6 + 12
    assert receipt.estimated_dollars_lost == 4.99
    assert receipt.verdict == "HIGH DARK-PATTERN MANIPULATION (Severe Friction)"
    print("[OK] FrictionEngine unit test passed cleanly!")

def test_vision_heuristic_classification():
    classifier = VisionLLMClassifier()

    evil_dom = """
    <div>
      <span class="timer">Offer expires in 04:59</span>
      <input type="checkbox" checked> Add $2.99 VIP Express Package Protection
      <button>No thanks, I like paying full price</button>
      <div class="fee">+ $4.99 Processing & Platform Service Fee</div>
      <input type="password" placeholder="Re-enter account password to confirm">
      <p>To cancel membership, call 1-800-DARK-PAT (Mon-Fri 9am-5pm EST)</p>
    </div>
    """

    findings = classifier.classify_screen("dummy.png", evil_dom, 3, "Checkout Final Review")
    
    pattern_ids = [f["pattern_id"] for f in findings]
    assert "hidden_cost" in pattern_ids
    assert "confirmshaming" in pattern_ids
    assert "forced_reauth" in pattern_ids
    assert "roach_motel" in pattern_ids
    assert "preselected_addon" in pattern_ids
    assert "false_urgency" in pattern_ids

    print("[OK] VisionLLMClassifier heuristic unit test passed cleanly!")

if __name__ == "__main__":
    test_friction_engine_scoring()
    test_vision_heuristic_classification()
    print("ALL VISH UNIT TESTS PASSED SUCCESSFULLY!")
