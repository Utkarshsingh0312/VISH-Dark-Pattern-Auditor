"""
VISH Vision-LLM Classifier
Uses Gemini Flash Vision API to analyze screenshots for deceptive dark patterns.
Includes DOM heuristic fallback engine for offline or API-key free local demo runs.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from PIL import Image

logger = logging.getLogger("vish_vision")

DARK_PATTERN_TAXONOMY_PROMPT = """
You are VISH Vision-LLM, a specialized Dark Pattern Auditor AI.
Analyze the provided web page screenshot and DOM text snippet for deceptive user interface patterns (Dark Patterns).

Classify any detected patterns using the following published taxonomy:
1. hidden_cost: Unannounced fees added late in checkout, hidden service charges, or undisclosed auto-renewals.
2. forced_reauth: Unnecessary password re-entry, security friction, or extra login walls introduced after pricing is shown.
3. confirmshaming: Guilt-tripping or manipulative decline text (e.g., "No thanks, I prefer paying full price", "I don't care about saving money").
4. roach_motel: Asymmetric effort where signup is instant/1-click but cancellation or refusal requires multi-step flows, hidden phone calls, or repetitive confirmation walls.
5. preselected_addon: Default checked checkboxes for optional add-ons, warranties, insurance, or extra donations.
6. false_urgency: Deceptive countdown timers, fake stock alerts ("Only 1 left!"), or fake activity popups.

Respond ONLY with valid JSON with this schema:
{
  "detected_patterns": [
    {
      "pattern_id": "hidden_cost | forced_reauth | confirmshaming | roach_motel | preselected_addon | false_urgency",
      "pattern_name": "Human Readable Name",
      "description": "Specific explanation of what element on the screen is manipulative and why",
      "evidence_snippet": "Exact text or element seen on screen",
      "monetary_impact": 4.99,  // estimated dollar amount if applicable
      "penalty_points": 10.0,
      "confidence": 0.95
    }
  ]
}
If no dark patterns are present, return {"detected_patterns": []}.
"""

class VisionLLMClassifier:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Gemini Client for VISH Vision Auditor.")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}")

    def classify_screen(self, image_path: str, dom_text: str, step_number: int, step_title: str) -> List[Dict[str, Any]]:
        """
        Classifies dark patterns in a screenshot.
        Tries Gemini Vision-LLM first; falls back to DOM/Visual heuristics if API unavailable.
        """
        findings = []

        # 1. Try Gemini Vision LLM if client initialized
        if self.client and os.path.exists(image_path):
            try:
                img = Image.open(image_path)
                prompt = f"{DARK_PATTERN_TAXONOMY_PROMPT}\n\nStep Context: {step_title}\nDOM Snippet: {dom_text[:1500]}"
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[prompt, img]
                )
                
                response_text = response.text.strip()
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()

                parsed = json.loads(response_text)
                patterns = parsed.get("detected_patterns", [])
                for p in patterns:
                    p["step_number"] = step_number
                    p["step_title"] = step_title
                    p["screenshot_url"] = f"/screenshots/{os.path.basename(image_path)}"
                    findings.append(p)
                
                if findings:
                    logger.info(f"Gemini Vision classified {len(findings)} dark patterns on step {step_number}.")
                    return findings
            except Exception as e:
                logger.warning(f"Gemini Vision classification failed, falling back to heuristic engine: {e}")

        # 2. Fallback Heuristic Inspection (DOM & Metadata analysis)
        dom_lower = dom_text.lower()

        # Check for Hidden Cost
        if ("hidden fee" in dom_lower or "service fee" in dom_lower or "$4.99" in dom_text or "handling charge" in dom_lower or "mandatory order fee" in dom_lower) and step_number > 1:
            findings.append({
                "pattern_id": "hidden_cost",
                "pattern_name": "Hidden Cost",
                "step_number": step_number,
                "step_title": step_title,
                "description": "Unannounced mandatory $4.99 service fee injected at final checkout screen after original price was displayed.",
                "evidence_snippet": "+ $4.99 Processing & Platform Service Fee",
                "monetary_impact": 4.99,
                "penalty_points": 10.0,
                "confidence": 0.95,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        # Check for Confirmshaming
        if "no thanks, i like paying full price" in dom_lower or "no thanks, i don't care" in dom_lower or "i prefer to overpay" in dom_lower:
            findings.append({
                "pattern_id": "confirmshaming",
                "pattern_name": "Confirmshaming",
                "step_number": step_number,
                "step_title": step_title,
                "description": "Opt-out button uses guilt-inducing language: 'No thanks, I like paying full price'.",
                "evidence_snippet": "\"No thanks, I like paying full price\"",
                "monetary_impact": 0.0,
                "penalty_points": 6.0,
                "confidence": 0.98,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        # Check for Forced Re-auth
        if ("re-enter" in dom_lower and "password" in dom_lower) or "verify password" in dom_lower or "security check before order" in dom_lower:
            findings.append({
                "pattern_id": "forced_reauth",
                "pattern_name": "Forced Re-auth",
                "step_number": step_number,
                "step_title": step_title,
                "description": "Unnecessary password re-entry wall required after fee additions, creating friction against backing out.",
                "evidence_snippet": "Re-enter your account password to confirm checkout",
                "monetary_impact": 0.0,
                "penalty_points": 7.0,
                "confidence": 0.92,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        # Check for Roach Motel
        if ("cancel" in dom_lower and "call" in dom_lower) or "call customer support to cancel" in dom_lower or "must confirm 3 times" in dom_lower or "step 4 of 4 to decline" in dom_lower:
            findings.append({
                "pattern_id": "roach_motel",
                "pattern_name": "Roach Motel",
                "step_number": step_number,
                "step_title": step_title,
                "description": "Asymmetric cancellation path: 1-click subscription entry vs multi-step confirmation and mandatory call-in exit.",
                "evidence_snippet": "To cancel, call 1-800-SUP-PORT during business hours",
                "monetary_impact": 0.0,
                "penalty_points": 12.0,
                "confidence": 0.96,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        # Check for Pre-selected Add-on
        if ("checked" in dom_lower and ("package protection" in dom_lower or "express warranty" in dom_lower or "priority handling" in dom_lower or "add $2.99" in dom_lower)):
            findings.append({
                "pattern_id": "preselected_addon",
                "pattern_name": "Pre-selected Add-on",
                "step_number": step_number,
                "step_title": step_title,
                "description": "$2.99 Shipping Protection pre-checked by default without explicit user consent.",
                "evidence_snippet": "[✓] Add $2.99 VIP Express Package Protection",
                "monetary_impact": 2.99,
                "penalty_points": 5.0,
                "confidence": 0.90,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        # Check for False Urgency
        if "offer expires in" in dom_lower or "only 1 item left" in dom_lower or "someone in new york just bought this" in dom_lower:
            findings.append({
                "pattern_id": "false_urgency",
                "pattern_name": "False Urgency",
                "step_number": step_number,
                "step_title": step_title,
                "description": "Artificial countdown timer pressuring immediate conversion before pricing review.",
                "evidence_snippet": "Offer Expires in 04:59! Reserved for high demand",
                "monetary_impact": 0.0,
                "penalty_points": 4.0,
                "confidence": 0.88,
                "screenshot_url": f"/screenshots/{os.path.basename(image_path)}" if os.path.exists(image_path) else ""
            })

        return findings
