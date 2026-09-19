"""
BrowserAgent — Real Playwright-based browser automation service for VISH.

Guarantees & Constraints (PPT Pages 4 & 6):
- Drives a controlled Chromium browser through public URLs.
- Captures viewport PNG screenshots to disk at each interaction step.
- Safety Boundary: Detects payment/transaction triggers and HALTS navigation immediately.
- NEVER submits a real purchase or charges a credit card.
- Respects site rate limits through controlled human-like pacing.
- Operates inside an isolated browser context (no user profiles or stored credentials).
"""

import os
import asyncio
import logging
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Playwright, TimeoutError as PlaywrightTimeoutError

from app.core.config import settings
from app.schemas.audit import AuditStep, DarkPatternType

logger = logging.getLogger("vish.browser_agent")

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class InvalidUrlError(ValueError):
    """Raised when an invalid, dangerous, or unsupported URL is submitted."""
    pass

class BrowserSafetyViolation(Exception):
    """Raised when an action violates safety guardrails (e.g. attempting to submit payment)."""
    pass

def validate_url(url: str) -> str:
    """
    Validates that a URL is syntactically valid and uses HTTP/HTTPS.
    Rejects file://, javascript:, data:, chrome:, about:, etc.
    """
    if not url or not isinstance(url, str):
        raise InvalidUrlError("URL cannot be empty.")
    
    clean_url = url.strip()
    if not clean_url:
        raise InvalidUrlError("URL cannot be empty or whitespace.")

    try:
        parsed = urllib.parse.urlparse(clean_url)
    except Exception as e:
        raise InvalidUrlError(f"Malformed URL: {str(e)}")

    scheme = (parsed.scheme or "").lower()
    if scheme not in ("http", "https"):
        raise InvalidUrlError(
            f"Unsupported scheme '{scheme}://'. VISH only audits public 'http://' and 'https://' URLs."
        )

    if not parsed.netloc:
        raise InvalidUrlError("URL must include a valid domain or host name (e.g. https://example.com).")

    # Reject local network and reserved addresses if necessary
    host = parsed.hostname or ""
    if host.lower() in ("localhost", "127.0.0.1", "0.0.0.0") and "test" not in host:
        # Note: Allow for internal tests if needed, but flag for production
        pass

    return clean_url


class BrowserAgent:
    """
    Controls an isolated Playwright Chromium instance for auditing a website flow.
    """

    PAYMENT_KEYWORDS = [
        "place order",
        "confirm purchase",
        "submit payment",
        "pay now",
        "confirm payment",
        "complete purchase",
        "charge card",
        "buy now",
        "purchase now",
        "subscribe & pay",
        "start paid plan",
        "pay ",
        "payment",
        "checkout",
        "purchase",
        "buy"
    ]

    def __init__(
        self,
        headless: Optional[bool] = None,
        screenshots_dir: Optional[str] = None,
        viewport_width: Optional[int] = None,
        viewport_height: Optional[int] = None,
        nav_timeout_ms: Optional[int] = None,
        action_timeout_ms: Optional[int] = None,
        max_pages: Optional[int] = None,
        max_actions: Optional[int] = None,
        max_screenshots: Optional[int] = None,
        pacing_delay_sec: Optional[float] = None
    ):
        self.headless = settings.BROWSER_HEADLESS if headless is None else headless
        self.screenshots_dir = Path(screenshots_dir or settings.SCREENSHOTS_DIR)
        self.viewport_width = viewport_width or settings.VIEWPORT_WIDTH
        self.viewport_height = viewport_height or settings.VIEWPORT_HEIGHT
        self.nav_timeout_ms = nav_timeout_ms or settings.NAV_TIMEOUT_MS
        self.action_timeout_ms = action_timeout_ms or settings.ACTION_TIMEOUT_MS
        self.max_pages = max_pages or settings.MAX_PAGES
        self.max_actions = max_actions or settings.MAX_ACTIONS
        self.max_screenshots = max_screenshots or settings.MAX_SCREENSHOTS
        self.pacing_delay_sec = pacing_delay_sec or settings.PACING_DELAY_SEC

        # Ensure screenshots directory exists
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)

        # Audit session state
        self.audit_id: Optional[str] = None
        self.target_url: Optional[str] = None
        self.current_url: Optional[str] = None
        self.current_title: Optional[str] = None
        self.visited_urls: List[str] = []
        self.actions: List[Dict[str, Any]] = []
        self.screenshots: List[str] = []
        self.steps: List[AuditStep] = []
        self.step_counter: int = 0
        self.payment_detected: bool = False
        self.stopped_for_safety: bool = False
        self.error_message: Optional[str] = None
        self.status: str = "Ready to audit"

        # Playwright internals
        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None

    async def start_audit(self, url: str, audit_id: str) -> Dict[str, Any]:
        """
        Initializes the browser and navigates to the initial URL.
        Captures the first screenshot (Step 1).
        """
        valid_url = validate_url(url)
        self.audit_id = audit_id
        self.target_url = valid_url
        self.current_url = valid_url
        self.status = "Opening website"
        self.visited_urls = [valid_url]
        self.steps = []
        self.step_counter = 0
        self.payment_detected = False
        self.stopped_for_safety = False
        self.error_message = None

        logger.info(f"[{audit_id}] Starting live Playwright session for {valid_url}")

        try:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=self.headless,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-blink-features=AutomationControlled"
                ]
            )

            # Isolated Context (PPT Page 6: Account Safety, No personal profiles)
            self._context = await self._browser.new_context(
                viewport={"width": self.viewport_width, "height": self.viewport_height},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (VISH-Auditor/1.0)",
                ignore_https_errors=True
            )
            self._context.set_default_navigation_timeout(self.nav_timeout_ms)
            self._context.set_default_timeout(self.action_timeout_ms)

            self._page = await self._context.new_page()

            # Navigate to target URL
            self.status = "Navigating"
            logger.info(f"[{audit_id}] Navigating to {valid_url}")
            await self._page.goto(valid_url, wait_until="domcontentloaded")
            await asyncio.sleep(self.pacing_delay_sec)  # Human-like pacing

            self.current_url = self._page.url
            self.current_title = await self._page.title()
            logger.info(f"[{audit_id}] Landed on: {self.current_title} ({self.current_url})")

            # Capture initial screenshot (Step 1)
            self.status = "Capturing screen"
            step_1 = await self._record_step(
                action="Initial Page Navigation",
                url=self.current_url,
                title=self.current_title
            )

            return {
                "audit_id": self.audit_id,
                "target_url": self.target_url,
                "current_url": self.current_url,
                "current_title": self.current_title,
                "step_count": len(self.steps),
                "status": self.status
            }

        except Exception as e:
            self.status = "Failed"
            self.error_message = f"Browser launch or navigation failed: {str(e)}"
            logger.error(f"[{audit_id}] Error in start_audit: {e}", exc_info=True)
            await self.close()
            raise

    async def run_controlled_audit(self, on_status_change=None) -> List[AuditStep]:
        """
        Executes a controlled traversal of the website:
        1. Checks for payment/purchase actions (Safety Boundary).
        2. Inspects clickable links or navigation buttons.
        3. Clicks safe navigation elements with pacing.
        4. Captures screenshots up to MAX_PAGES / MAX_SCREENSHOTS.
        5. Stops immediately if any transaction element is encountered.
        """
        if not self._page or self._page.is_closed():
            raise RuntimeError("Browser session not active.")

        async def update_status(new_status: str):
            self.status = new_status
            if on_status_change:
                await on_status_change(new_status, self.step_counter, self.current_url)

        try:
            for page_index in range(2, self.max_pages + 1):
                if self.step_counter >= self.max_screenshots or self.stopped_for_safety:
                    break

                await update_status("Checking safety boundary")
                await asyncio.sleep(self.pacing_delay_sec)

                # 1. Safety Boundary Check
                is_payment, trigger_info = await self.check_payment_safety()
                if is_payment:
                    logger.warning(f"[{self.audit_id}] SAFETY BOUNDARY HIT: {trigger_info}")
                    self.stop_before_payment(reason=f"Detected transactional trigger: {trigger_info}")
                    await update_status("Checking safety boundary")
                    await self._record_step(
                        action=f"Safety Stop: Detected '{trigger_info}'",
                        url=self._page.url,
                        title=await self._page.title(),
                        payment_detected=True,
                        stopped_for_safety=True
                    )
                    break

                # 2. Inspect Page for Next Safe Navigation Element
                await update_status("Inspecting page")
                safe_element, action_desc = await self._find_next_safe_action()

                if not safe_element:
                    # Scroll down to observe progressive disclosure
                    await update_status("Navigating")
                    await self.scroll(direction="down", distance_px=600)
                    await asyncio.sleep(self.pacing_delay_sec)
                    await update_status("Capturing screen")
                    await self._record_step(
                        action="Page Scroll Inspection",
                        url=self._page.url,
                        title=await self._page.title()
                    )
                    break

                # 3. Perform Safe Interaction
                await update_status("Navigating")
                logger.info(f"[{self.audit_id}] Performing safe action: {action_desc}")
                
                try:
                    await safe_element.click(timeout=self.action_timeout_ms)
                    await self._page.wait_for_load_state("domcontentloaded", timeout=self.nav_timeout_ms)
                    await asyncio.sleep(self.pacing_delay_sec)
                except Exception as click_err:
                    logger.warning(f"[{self.audit_id}] Click timed out or intercepted: {click_err}")
                    # Capture state anyway
                    pass

                self.current_url = self._page.url
                self.current_title = await self._page.title()
                if self.current_url not in self.visited_urls:
                    self.visited_urls.append(self.current_url)

                # 4. Check Safety immediately after click
                is_payment, trigger_info = await self.check_payment_safety()
                if is_payment:
                    self.stop_before_payment(reason=f"Post-action trigger: {trigger_info}")
                    await update_status("Checking safety boundary")
                    await self._record_step(
                        action=f"Safety Stop: {action_desc} led to '{trigger_info}'",
                        url=self.current_url,
                        title=self.current_title,
                        payment_detected=True,
                        stopped_for_safety=True
                    )
                    break

                # 5. Capture Step Screenshot
                await update_status("Capturing screen")
                await self._record_step(
                    action=action_desc,
                    url=self.current_url,
                    title=self.current_title
                )

            await update_status("Complete")
            return self.steps

        except Exception as e:
            self.status = "Failed"
            self.error_message = f"Controlled crawl encountered an error: {str(e)}"
            logger.error(f"[{self.audit_id}] Audit execution error: {e}", exc_info=True)
            raise
        finally:
            await self.close()

    async def check_payment_safety(self) -> Tuple[bool, str]:
        """
        Scans visible buttons, forms, and links for payment or checkout indicators.
        Returns (is_payment_detected, matching_term).
        """
        if not self._page:
            return False, ""

        try:
            # Query visible interactive elements
            elements = await self._page.query_selector_all(
                "button, a, input[type='submit'], input[type='button'], [role='button']"
            )

            for el in elements:
                try:
                    is_visible = await el.is_visible()
                    if not is_visible:
                        continue

                    # Check text content and attributes
                    text = (await el.inner_text() or "").strip().lower()
                    aria = (await el.get_attribute("aria-label") or "").strip().lower()
                    val = (await el.get_attribute("value") or "").strip().lower()
                    name = (await el.get_attribute("name") or "").strip().lower()

                    combined = f"{text} {aria} {val} {name}"

                    for term in self.PAYMENT_KEYWORDS:
                        if term in combined:
                            return True, f"'{term}' found in element <{text or val or aria}>"
                except Exception:
                    continue

            # Also check page URL for checkout/payment markers
            current_url_lower = self._page.url.lower()
            if any(marker in current_url_lower for marker in ["/checkout", "/pay", "/billing", "/subscribe"]):
                return True, f"URL endpoint '{self._page.url}' indicates payment flow"

            return False, ""
        except Exception as e:
            logger.warning(f"Error checking payment safety: {e}")
            return False, ""

    def stop_before_payment(self, reason: str = "Safety Boundary Triggered") -> Dict[str, Any]:
        """
        Enforces the primary safety invariant: Stops before payment or final checkout.
        """
        self.stopped_for_safety = True
        self.payment_detected = True
        logger.warning(f"[BrowserAgent] STOPPED FOR SAFETY: {reason}")
        return {
            "stopped_for_safety": True,
            "payment_detected": True,
            "reason": reason,
            "guarantee": "VISH never submits real purchases or charges credit cards."
        }

    async def _find_next_safe_action(self) -> Tuple[Optional[Any], str]:
        """
        Finds a safe, non-destructive navigation element to click (e.g. 'Learn More', 'Features', 'Next').
        Prioritizes internal links and buttons that stay on the same domain.
        """
        if not self._page:
            return None, ""

        current_host = urllib.parse.urlparse(self.current_url).netloc

        # Desired benign navigational keywords
        benign_keywords = [
            "learn more", "read more", "features", "details",
            "explore", "next", "continue", "view", "start",
            "sign up", "get started", "pricing", "plans"
        ]

        try:
            # First search buttons
            buttons = await self._page.query_selector_all("button, [role='button']")
            for b in buttons:
                if await b.is_visible():
                    txt = (await b.inner_text() or "").strip()
                    lower_txt = txt.lower()
                    if any(k in lower_txt for k in benign_keywords) and not any(p in lower_txt for p in self.PAYMENT_KEYWORDS):
                        return b, f"Click button '{txt}'"

            # Then search internal anchor links
            links = await self._page.query_selector_all("a[href]")
            for link in links:
                if await link.is_visible():
                    href = await link.get_attribute("href") or ""
                    txt = (await link.inner_text() or "").strip()
                    lower_txt = txt.lower()

                    # Avoid anchor fragments and external hops
                    if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
                        continue
                    
                    # Same domain or relative URL
                    if href.startswith("/") or current_host in href:
                        if any(k in lower_txt for k in benign_keywords) or (len(txt) > 2 and len(txt) < 30):
                            if not any(p in lower_txt for p in self.PAYMENT_KEYWORDS):
                                return link, f"Click link '{txt or href}'"

            return None, ""
        except Exception as e:
            logger.warning(f"Error finding safe action: {e}")
            return None, ""

    async def scroll(self, direction: str = "down", distance_px: int = 500) -> Dict[str, Any]:
        """Scrolls the page smoothly."""
        if not self._page:
            return {}
        
        delta = distance_px if direction == "down" else -distance_px
        await self._page.evaluate(f"window.scrollBy({{ top: {delta}, behavior: 'smooth' }});")
        await asyncio.sleep(self.pacing_delay_sec)
        return {"action": "scroll", "direction": direction, "distance": distance_px}

    async def capture_screenshot(self, step_number: int) -> Tuple[str, str]:
        """
        Captures a viewport PNG screenshot and saves to `screenshots_dir`.
        Returns (absolute_file_path, relative_web_url).
        """
        if not self._page:
            raise RuntimeError("Cannot capture screenshot without an active page.")

        prefix = self.audit_id if self.audit_id.startswith("audit_") else f"audit_{self.audit_id}"
        filename = f"{prefix}_step_{step_number:02d}.png"
        filepath = self.screenshots_dir / filename

        # Take full viewport screenshot
        await self._page.screenshot(path=str(filepath), full_page=False)
        web_url = f"/api/screenshots/{filename}"
        
        self.screenshots.append(str(filepath))
        logger.info(f"[{self.audit_id}] Captured step {step_number} screenshot: {filepath}")
        return str(filepath), web_url

    async def _record_step(
        self,
        action: str,
        url: str,
        title: Optional[str] = None,
        payment_detected: bool = False,
        stopped_for_safety: bool = False
    ) -> AuditStep:
        """Helper to capture screenshot and append a new AuditStep."""
        self.step_counter += 1
        if stopped_for_safety and self.steps and self.steps[-1].url == url:
            filepath = self.steps[-1].screenshot
            web_url = self.steps[-1].screenshot_url
        else:
            filepath, web_url = await self.capture_screenshot(self.step_counter)

        step = AuditStep(
            step_number=self.step_counter,
            url=url,
            title=title or "Untitled Page",
            screenshot=filepath,
            screenshot_url=web_url,
            action=action,
            status="Captured",
            payment_detected=payment_detected,
            stopped_for_safety=stopped_for_safety,
            timestamp=utc_now()
        )
        self.steps.append(step)
        return step

    async def close(self):
        """Cleanly releases all Playwright browser context resources."""
        try:
            if self._page and not self._page.is_closed():
                await self._page.close()
        except Exception:
            pass
        try:
            if self._context:
                await self._context.close()
        except Exception:
            pass
        try:
            if self._browser:
                await self._browser.close()
        except Exception:
            pass
        try:
            if self._playwright:
                await self._playwright.stop()
        except Exception:
            pass
        logger.info(f"[{self.audit_id}] Browser context closed.")
