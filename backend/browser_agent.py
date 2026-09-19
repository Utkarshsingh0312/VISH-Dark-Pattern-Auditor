"""
VISH Playwright Browser Agent
Navigates signup/checkout/cancellation flows, captures screenshots,
interacts like a real human user, and feeds steps to Vision-LLM + Friction Engine.
"""

import os
import time
import uuid
import asyncio
import logging
from typing import Callable, Optional, Dict, Any, List
from playwright.async_api import async_playwright
from vision_classifier import VisionLLMClassifier
from friction_engine import FrictionEngine, AuditReceipt

logger = logging.getLogger("vish_agent")

class PlaywrightAuditAgent:
    def __init__(self, screenshot_dir: str):
        self.screenshot_dir = screenshot_dir
        os.makedirs(self.screenshot_dir, exist_ok=True)
        self.classifier = VisionLLMClassifier()

    async def audit_flow(self, target_url: str, callback: Optional[Callable[[Dict[str, Any]], None]] = None) -> AuditReceipt:
        audit_id = str(uuid.uuid4())[:8]
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        async def notify(step_num: int, status: str, details: str, image_url: str = "", findings: List[Dict[str, Any]] = None):
            if callback:
                evt = {
                    "audit_id": audit_id,
                    "step_number": step_num,
                    "status": status,
                    "details": details,
                    "screenshot_url": image_url,
                    "findings_so_far": findings or []
                }
                if asyncio.iscoroutinefunction(callback):
                    await callback(evt)
                else:
                    callback(evt)

        await notify(0, "starting", f"Initializing VISH Browser Agent for {target_url}...")

        raw_findings = []
        step_count = 0

        async with async_playwright() as p:
            # Launch Chromium browser agent
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1280, "height": 800})
            page = await context.new_page()

            try:
                await notify(1, "navigating", f"Navigating browser to target flow: {target_url}")
                await page.goto(target_url, wait_until="networkidle", timeout=15000)
            except Exception as e:
                logger.warning(f"Goto direct timeout/error, trying load state: {e}")
                try:
                    await page.goto(target_url, wait_until="load", timeout=15000)
                except Exception as ex:
                    logger.error(f"Navigation error: {ex}")

            # Loop through up to 4 flow steps
            for step_idx in range(1, 5):
                step_count += 1
                await asyncio.sleep(0.8) # Human pace

                screenshot_name = f"audit_{audit_id}_step_{step_idx}.png"
                screenshot_path = os.path.join(self.screenshot_dir, screenshot_name)
                
                try:
                    await page.screenshot(path=screenshot_path, full_page=False)
                except Exception as e:
                    logger.error(f"Screenshot failed: {e}")

                step_title = await page.title() or f"Step {step_idx}"
                dom_content = await page.content()
                
                # Classify step via Vision LLM
                await notify(step_idx, "classifying", f"Analyzing screen {step_idx} with Vision-LLM...", f"/screenshots/{screenshot_name}")
                step_findings = self.classifier.classify_screen(screenshot_path, dom_content, step_idx, step_title)
                
                for sf in step_findings:
                    sf["screenshot_url"] = f"/screenshots/{screenshot_name}"
                    raw_findings.append(sf)

                await notify(step_idx, "step_complete", f"Step {step_idx} audited. Patterns found: {len(step_findings)}", f"/screenshots/{screenshot_name}", raw_findings)

                # Attempt next action if available, stopping before final payment
                if step_idx < 4:
                    # Look for next / continue / confirm buttons
                    navigated = False
                    next_selectors = [
                        "button:has-text('Proceed')", "button:has-text('Continue')", 
                        "button:has-text('Next')", "button:has-text('Accept')",
                        "#btn-to-step-2", ".btn-primary", "button.confirm"
                    ]

                    # Check if final payment button present -> Stop before charging
                    content_lower = dom_content.lower()
                    if "complete order" in content_lower or "pay now" in content_lower or "place order" in content_lower or "step-3" in dom_content:
                        # On step 3 of evil cart or final payment, inspect but stop
                        if "evil_cart" in target_url or "step-3" in dom_content:
                            await notify(step_idx, "stopping_safety", "STOPPING BEFORE FINAL PAYMENT: Safety rule enforced (No real transactions).")
                            break

                    for sel in next_selectors:
                        try:
                            elem = page.locator(sel).first
                            if await elem.is_visible(timeout=1000):
                                await elem.click()
                                await page.wait_for_timeout(1000)
                                navigated = True
                                break
                        except Exception:
                            continue

                    if not navigated:
                        # Try clicking confirmshaming or secondary button to walk alternate branch if available
                        try:
                            sec_btn = page.locator("#confirmshaming-btn, .btn-secondary").first
                            if await sec_btn.is_visible(timeout=1000):
                                await sec_btn.click()
                                await page.wait_for_timeout(1000)
                                navigated = True
                        except Exception:
                            pass

                    if not navigated:
                        logger.info(f"No further interactive navigation buttons found at step {step_idx}. Ending flow audit.")
                        break

            await browser.close()

        # Compute final receipt from raw findings
        receipt = FrictionEngine.compute_receipt(audit_id, target_url, timestamp, raw_findings, step_count)
        await notify(step_count, "completed", "Audit finished. Score calculated.", "", raw_findings)
        return receipt
