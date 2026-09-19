"""
VisionAnalyzer — Real Gemini Vision screenshot analysis service for VISH.

Primary Source of Truth: VISH Presentation (PPT Page 3 & 5).
Pipeline:
Real Screenshot -> Gemini Vision -> 4 PPT Categories Only ->
Evidence (What + Where + Why) -> Confidence -> Human Review Flag -> Friction Engine

Supported PPT Categories ONLY:
1. Hidden Cost (Reversible × monetary impact)
2. Forced Re-auth (Adds friction after cost is shown)
3. Confirmshaming (Coercive language on decline path)
4. Roach Motel (Entry vs. exit effort asymmetry)
"""

import os
import json
import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from app.core.config import settings
from app.schemas.audit import Detection, DarkPatternType, RawGeminiVisionResponse, RawGeminiDetection
from app.services.friction_engine import FrictionEngine

logger = logging.getLogger("vish.vision_analyzer")

# System instruction strictly confining analysis to the 4 PPT categories
VISH_VISION_SYSTEM_PROMPT = """You are VISH, an objective compliance and dark-pattern auditor analyzing website viewport screenshots.
Your goal is to inspect the visual screenshot and detect whether any of the four published dark-pattern categories from the VISH methodology are visibly present.

THE FOUR SUPPORTED CATEGORIES ARE EXCLUSIVELY:
1. "Hidden Cost": An undisclosed monetary fee, processing charge, or mandatory tip that is suddenly added to the subtotal, hidden in small print, or revealed only at the final stage.
2. "Forced Re-auth": A screen requiring unnecessary login credential re-entry, password confirmation, or authentication friction after a price or decision has already been displayed.
3. "Confirmshaming": Guilt-inducing, manipulative, or emotionally coercive language used on opt-out buttons or decline links (e.g., "No thanks, I like paying full price", "I don't care about savings").
4. "Roach Motel": Visible terms, modals, or banners indicating that subscribing or creating an account is immediate/one-click, but cancelling or exiting requires phone calls, mailing letters, or convoluted barriers.

STRICT AUDIT RULES:
- ONLY analyze what is visibly legible and observable in the provided screenshot image.
- DO NOT extrapolate, assume, or guess hidden backend behaviors not shown in the image.
- If the screenshot does not show clear visible evidence of any of these four categories, you MUST return an empty detections array: {"detections": []}.
- For each genuine detection:
  - "pattern_name": MUST be one of ["Hidden Cost", "Forced Re-auth", "Confirmshaming", "Roach Motel"].
  - "description": Explain WHY the visible evidence corresponds to the category.
  - "evidence": Quote the exact text or describe the specific visual element seen in the screenshot.
  - "location": State WHERE the evidence is located (e.g. "Bottom checkout button", "Right sidebar summary", "Modal overlay").
  - "confidence": A float between 0.0 and 1.0 reflecting your certainty based strictly on visible evidence.

Output ONLY valid JSON matching this schema:
{
  "detections": [
    {
      "pattern_name": "Hidden Cost",
      "description": "...",
      "evidence": "...",
      "location": "...",
      "confidence": 0.92
    }
  ]
}
"""

class VisionAnalyzer:
    """
    Analyzes browser viewport screenshots using Gemini Vision models.
    Falls back to clearly marked mock analysis when no API key is provided.
    """

    ALLOWED_CATEGORIES = {
        DarkPatternType.HIDDEN_COST.value.lower(): DarkPatternType.HIDDEN_COST.value,
        DarkPatternType.FORCED_REAUTH.value.lower(): DarkPatternType.FORCED_REAUTH.value,
        DarkPatternType.CONFIRMSHAMING.value.lower(): DarkPatternType.CONFIRMSHAMING.value,
        DarkPatternType.ROACH_MOTEL.value.lower(): DarkPatternType.ROACH_MOTEL.value
    }

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        confidence_threshold: Optional[float] = None
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = model_name or settings.GEMINI_MODEL
        self.confidence_threshold = confidence_threshold or settings.GEMINI_CONFIDENCE_THRESHOLD
        self.has_real_ai = bool(self.api_key and len(self.api_key.strip()) > 5)

        self._exhausted_models = set()
        self._client = None
        if self.has_real_ai:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key.strip())
                logger.info(f"[VisionAnalyzer] Initialized with real Gemini client (Model: {self.model_name})")
            except Exception as e:
                logger.error(f"[VisionAnalyzer] Failed to initialize Google GenAI client: {e}")
                self.has_real_ai = False
        else:
            logger.info("[VisionAnalyzer] No valid GEMINI_API_KEY found. Running in MOCK fallback mode.")

    async def analyze_screenshot(
        self,
        screenshot_path: Optional[str],
        page_url: Optional[str] = None,
        page_title: Optional[str] = None,
        step_number: int = 1
    ) -> List[Detection]:
        """
        Analyzes a screenshot file and returns dark pattern detections.
        """
        if not self.has_real_ai or not self._client:
            return self._generate_step3_mock_fallback(step_number, page_url)

        if not screenshot_path or not Path(screenshot_path).exists():
            logger.warning(f"[VisionAnalyzer] Screenshot path not found: {screenshot_path}")
            return []

        try:
            return await self._call_real_gemini_vision(screenshot_path, page_url, page_title, step_number)
        except Exception as e:
            logger.error(f"[VisionAnalyzer] Gemini Vision API call failed: {e}", exc_info=True)
            # Safe degradation: preserve screenshot, return empty detections with structured log
            return []

    async def _call_real_gemini_vision(
        self,
        screenshot_path: str,
        page_url: Optional[str],
        page_title: Optional[str],
        step_number: int
    ) -> List[Detection]:
        """Calls Gemini Vision API with image bytes and structured prompt."""
        from google.genai import types

        with open(screenshot_path, "rb") as f:
            image_bytes = f.read()

        user_content = [
            types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
            (
                f"Analyze this website screenshot taken at step #{step_number}.\n"
                f"Page URL: {page_url or 'Unknown'}\n"
                f"Page Title: {page_title or 'Untitled'}\n"
                f"Inspect for the four PPT dark-pattern categories only: "
                f"Hidden Cost, Forced Re-auth, Confirmshaming, Roach Motel.\n"
                f"Return valid JSON matching the schema."
            )
        ]

        logger.info(f"[VisionAnalyzer] Sending screenshot {screenshot_path} to Gemini ({self.model_name})...")
        
        # Call generate_content (in a thread pool to avoid blocking the event loop)
        import asyncio
        loop = asyncio.get_running_loop()
        
        all_candidates = [self.model_name]
        for fallback in ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"]:
            if fallback not in all_candidates:
                all_candidates.append(fallback)

        candidate_models = [m for m in all_candidates if m not in self._exhausted_models]
        if not candidate_models:
            # If all were marked exhausted, reset to allow retry
            self._exhausted_models.clear()
            candidate_models = list(all_candidates)

        # Call generate_content with retry and fallback across supported models
        def _invoke_gemini():
            import time
            last_err = None
            for current_model in candidate_models:
                for attempt in range(3):
                    try:
                        return self._client.models.generate_content(
                            model=current_model,
                            contents=user_content,
                            config=types.GenerateContentConfig(
                                system_instruction=VISH_VISION_SYSTEM_PROMPT,
                                temperature=0.1,
                                response_mime_type="application/json"
                            )
                        )
                    except Exception as call_err:
                        last_err = call_err
                        err_msg = str(call_err)
                        if ("503" in err_msg or "UNAVAILABLE" in err_msg) and attempt < 2:
                            wait_time = 2.0 * (attempt + 1)
                            logger.warning(f"[VisionAnalyzer] Gemini ({current_model}) transient 503 spike, retrying in {wait_time}s...")
                            time.sleep(wait_time)
                            continue
                        elif any(code in err_msg for code in ["429", "404", "RESOURCE_EXHAUSTED", "NOT_FOUND"]):
                            self._exhausted_models.add(current_model)
                            logger.warning(f"[VisionAnalyzer] Model {current_model} unavailable ({err_msg[:60]}), checking next candidate model...")
                            break
                        raise call_err
            if last_err:
                raise last_err

        response = await loop.run_in_executor(None, _invoke_gemini)
        raw_text = response.text or ""
        logger.info(f"[VisionAnalyzer] Received response from Gemini: {raw_text[:200]}...")

        return self.parse_gemini_response(raw_text, step_number)

    def parse_gemini_response(self, raw_text: str, step_number: int = 1) -> List[Detection]:
        """
        Parses raw text response from Gemini into validated Detection objects.
        Enforces category restriction, confidence threshold, and FrictionEngine scoring.
        """
        clean_json_str = self._extract_json_block(raw_text)
        if not clean_json_str:
            logger.warning("[VisionAnalyzer] Could not extract JSON from model response.")
            return []

        try:
            parsed = json.loads(clean_json_str)
        except Exception as json_err:
            logger.warning(f"[VisionAnalyzer] JSON parse error: {json_err}. Raw text: {raw_text[:300]}")
            return []

        # Extract detections array
        raw_items = []
        if isinstance(parsed, dict) and "detections" in parsed:
            raw_items = parsed["detections"]
        elif isinstance(parsed, list):
            raw_items = parsed
        elif isinstance(parsed, dict):
            raw_items = [parsed]

        detections: List[Detection] = []

        for item in raw_items:
            if not isinstance(item, dict):
                continue

            # If model explicitly reported detected: false, skip
            if item.get("detected") is False:
                continue

            raw_name = str(item.get("pattern_name", "")).strip()
            norm_name = self.validate_category(raw_name)
            if not norm_name:
                logger.info(f"[VisionAnalyzer] Discarding non-PPT pattern category: '{raw_name}'")
                continue

            evidence = str(item.get("evidence", "")).strip()
            description = str(item.get("description", "")).strip()
            location = str(item.get("location", "")).strip() or "Visible viewport"

            # Parse confidence float
            try:
                conf = float(item.get("confidence", 0.85))
                conf = max(0.0, min(1.0, conf))
            except (ValueError, TypeError):
                conf = 0.85

            # Evaluate PPT Validation Loop: flag human review if below threshold
            needs_human_review = conf < self.confidence_threshold

            # Score contribution determined by FrictionEngine
            score_pts = FrictionEngine.score_detection(norm_name, evidence, description)

            detection = Detection(
                pattern_name=norm_name,
                step_number=step_number,
                description=description or f"Visible evidence of {norm_name}.",
                evidence=evidence or "Observed in UI elements.",
                location=location,
                score_contribution=score_pts,
                confidence=conf,
                needs_human_review=needs_human_review,
                analysis_source="gemini_vision",
                is_real_ai=True
            )
            detections.append(detection)

        return detections

    def validate_category(self, pattern_name: str) -> Optional[str]:
        """
        Validates that a pattern name matches one of the 4 PPT categories.
        Returns the canonical PPT category name, or None.
        """
        lower = pattern_name.strip().lower()
        for k, canonical in self.ALLOWED_CATEGORIES.items():
            if k in lower:
                return canonical
        return None

    def _extract_json_block(self, text: str) -> str:
        """Extracts JSON substring from markdown fences or raw string."""
        if not text:
            return ""
        
        # Match ```json ... ```
        fence_match = re.search(r"```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```", text, re.DOTALL)
        if fence_match:
            return fence_match.group(1).strip()

        # Match first { ... } or [ ... ]
        bracket_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if bracket_match:
            return bracket_match.group(1).strip()

        return text.strip()

    def _generate_step3_mock_fallback(self, step_number: int, page_url: Optional[str] = None) -> List[Detection]:
        """
        Mock fallback when GEMINI_API_KEY is not configured.
        Clearly marked as 'mock' analysis source so it is NEVER misrepresented as real AI.
        """
        # For benign sites like example.com, mock returns clean/no-detection
        if page_url and ("example.com" in page_url.lower() or "iana.org" in page_url.lower()):
            return []

        # Otherwise returns mock detections strictly from PPT categories for testing
        mock_scenarios = {
            1: Detection(
                pattern_name=DarkPatternType.CONFIRMSHAMING.value,
                step_number=1,
                description="[MOCK ANALYSIS] Coercive wording on subscription decline action.",
                evidence="Button: 'No thanks, I like paying full price'",
                location="Bottom modal footer",
                score_contribution=7,
                confidence=0.88,
                needs_human_review=False,
                analysis_source="mock",
                is_real_ai=False
            ),
            2: Detection(
                pattern_name=DarkPatternType.HIDDEN_COST.value,
                step_number=2,
                description="[MOCK ANALYSIS] Unexpected ancillary charge disclosed only on final checkout.",
                evidence="$4.99 fee shown only at final confirmation",
                location="Order summary card",
                score_contribution=12,
                confidence=0.95,
                needs_human_review=False,
                analysis_source="mock",
                is_real_ai=False
            ),
            3: Detection(
                pattern_name=DarkPatternType.FORCED_REAUTH.value,
                step_number=3,
                description="[MOCK ANALYSIS] Password re-entry required after fee appears.",
                evidence="Secondary credential prompt injected after $4.99 fee shown.",
                location="Center authentication modal",
                score_contribution=8,
                confidence=0.74,
                needs_human_review=True,  # Below 0.80 threshold
                analysis_source="mock",
                is_real_ai=False
            ),
            4: Detection(
                pattern_name=DarkPatternType.ROACH_MOTEL.value,
                step_number=4,
                description="[MOCK ANALYSIS] Entry vs. exit effort asymmetry.",
                evidence="One-click signup enabled; cancellation requires phone call.",
                location="Footer subscription terms",
                score_contribution=10,
                confidence=0.65,
                needs_human_review=True,  # Below 0.80 threshold
                analysis_source="mock",
                is_real_ai=False
            )
        }

        detection = mock_scenarios.get(step_number)
        return [detection] if detection else []
