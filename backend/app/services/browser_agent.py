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
import re
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

    return clean_url


class BrowserAgent:
    """
    Controls an isolated Playwright Chromium instance for auditing a website flow.
    """

    PAYMENT_KEYWORDS = [
        "place order",
        "place your order",
        "confirm purchase",
        "confirm and pay",
        "submit payment",
        "pay now",
        "confirm payment",
        "complete purchase",
        "complete payment",
        "complete booking & pay",
        "charge card",
        "charge my card",
        "authorize payment",
        "submit order",
        "pay with card",
        "pay with credit card",
        "pay with paypal",
        "buy now",
        "purchase now",
        "subscribe & pay",
        "start paid plan",
        "pay "
    ]

    PAYMENT_INPUT_SELECTORS = [
        "input[name*='cardnumber' i]",
        "input[name*='card-number' i]",
        "input[name*='cc-number' i]",
        "input[autocomplete*='cc-number']",
        "input[name*='cvv' i]",
        "input[name*='cvc' i]",
        "input[autocomplete*='cc-csc']",
        "iframe[src*='stripe.com']",
        "iframe[src*='braintree']",
        "iframe[src*='adyen']",
        "#card-element",
        "#payment-element"
    ]

    # Prioritized flow action keywords & selectors
    SIGNUP_KEYWORDS = [
        "create account", "sign up", "register", "join now", "join free",
        "create a free account", "new account", "sign up free", "join agoda", "get started"
    ]
    SIGNUP_SELECTORS = [
        "[data-element-name*='sign-up']", "[data-selenium*='sign-up']",
        "a[href*='signup']", "a[href*='register']", "a[href*='create-account']",
        "button[id*='signup']", "button[id*='register']"
    ]

    SEARCH_KEYWORDS = [
        "search", "find deals", "search hotels", "search flights", "find rooms",
        "explore deals", "search now", "find stay", "find flight", "show results",
        "view results", "see more properties", "see availability", "see more"
    ]
    SEARCH_SELECTORS = [
        "[data-element-name*='search']", "[data-selenium*='search']",
        "button[type='submit']", "button.search-button"
    ]

    ITEM_KEYWORDS = [
        "select", "book", "choose", "select room", "reserve",
        "see room options", "view deal", "select offer", "add to cart",
        "add to basket", "choose room", "select flight", "book room", "book now"
    ]
    ITEM_SELECTORS = [
        "[data-element-name*='book']", "[data-selenium*='select-room']"
    ]

    CHECKOUT_PROGRESSION_KEYWORDS = [
        "continue to booking", "proceed to checkout", "go to checkout", "proceed",
        "continue to guest details", "guest details", "continue to payment",
        "review booking", "review order", "next step", "checkout", "continue"
    ]
    CHECKOUT_SELECTORS = [
        "[data-element-name*='checkout']"
    ]

    CANCELLATION_KEYWORDS = [
        "cancellation policy", "cancel membership", "manage booking",
        "refund policy", "terms of cancellation", "cancellation fee", "cancel reservation"
    ]
    CANCELLATION_SELECTORS = [
        "a[href*='cancel']", "a[href*='refund']", "a[href*='cancellation']"
    ]

    CATEGORY_KEYWORDS = [
        "hotels", "flights", "flight + hotel", "packages",
        "homes & apts", "activities", "pricing", "plans", "deals", "vacation rentals"
    ]
    CATEGORY_SELECTORS = [
        "[role='tab']", "[role='tablist'] button"
    ]

    OTHER_KEYWORDS = [
        "learn more", "read more", "details", "features", "explore", "view", "start"
    ]

    CHALLENGE_TITLE_KEYWORDS = [
        "just a moment...",
        "attention required! | cloudflare",
        "security verification | cloudflare",
        "access denied | www.agoda.com",
        "access denied",
        "security check",
        "robot check"
    ]

    CHALLENGE_BODY_KEYWORDS = [
        "verify you are human",
        "verify that you are human",
        "are you human",
        "checking your browser",
        "confirm you are human",
        "confirming you are not a robot",
        "confirm you are not a robot",
        "please solve this challenge",
        "unusual activity detected",
        "unusual traffic from your computer network",
        "security check to continue",
        "press and hold to confirm",
        "robot check",
        "cloudflare ray id",
        "perimeterx"
    ]

    CHALLENGE_SELECTORS = [
        "iframe[src*='recaptcha/api2/anchor']",
        "iframe[src*='recaptcha/api2/bframe']",
        "iframe[src*='challenges.cloudflare.com']",
        "iframe[src*='turnstile']",
        "iframe[src*='hcaptcha.com']",
        "#cf-challenge-running",
        "#challenge-stage",
        "#challenge-form",
        ".cf-turnstile",
        ".g-recaptcha",
        ".h-captcha",
        "#px-captcha",
        "[data-sitekey]",
        "#distilIdentificationBlock"
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
        self.is_blocked: bool = False
        self.block_reason: Optional[str] = None
        self.error_message: Optional[str] = None
        self.status: str = "Ready to audit"
        self.performed_actions: List[str] = []

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
        self.performed_actions = []

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
            try:
                await self._page.wait_for_load_state("networkidle", timeout=2500)
            except Exception:
                pass
            await asyncio.sleep(self.pacing_delay_sec)  # Human-like pacing

            self.current_url = self._page.url
            self.current_title = await self._page.title()
            logger.info(f"[{audit_id}] Landed on: {self.current_title} ({self.current_url})")

            # Check for immediate anti-bot/security challenge on landing
            is_challenge, challenge_reason = await self.check_security_challenge()
            if is_challenge:
                self.is_blocked = True
                self.block_reason = f"Target site presented an anti-bot/security verification challenge ({challenge_reason}). VISH does not bypass security challenges, so the target could not be reliably analyzed."
                logger.warning(f"[{audit_id}] AUDIT BLOCKED: {self.block_reason}")
                self.status = "Audit Blocked"
                await self._record_step(
                    action=f"Blocked: Anti-bot Challenge ({challenge_reason})",
                    url=self.current_url,
                    title=self.current_title,
                    is_challenge=True
                )
                return {
                    "audit_id": self.audit_id,
                    "target_url": self.target_url,
                    "current_url": self.current_url,
                    "current_title": self.current_title,
                    "step_count": len(self.steps),
                    "status": "Audit Blocked",
                    "is_blocked": True,
                    "block_reason": self.block_reason
                }

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
        1. Checks for anti-bot / security challenges (halts navigation if blocked).
        2. Checks for payment/purchase actions (Safety Boundary).
        3. Inspects clickable links or navigation buttons.
        4. Clicks safe navigation elements with pacing.
        5. Captures screenshots up to MAX_PAGES / MAX_SCREENSHOTS.
        6. Stops immediately if any transaction element or security challenge is encountered.
        """
        if not self._page or self._page.is_closed():
            raise RuntimeError("Browser session not active.")

        if self.is_blocked:
            logger.warning(f"[{self.audit_id}] Already blocked by security challenge, skipping traversal.")
            return self.steps

        async def update_status(new_status: str):
            self.status = new_status
            if on_status_change:
                await on_status_change(new_status, self.step_counter, self.current_url)

        try:
            for page_index in range(2, self.max_pages + 1):
                if self.step_counter >= self.max_screenshots or self.stopped_for_safety or self.is_blocked:
                    break

                # 1. Challenge Check
                is_challenge, challenge_reason = await self.check_security_challenge()
                if is_challenge:
                    self.is_blocked = True
                    self.block_reason = f"Target site presented an anti-bot/security verification challenge ({challenge_reason}). VISH does not bypass security challenges, so the target could not be reliably analyzed."
                    logger.warning(f"[{self.audit_id}] AUDIT BLOCKED: {self.block_reason}")
                    self.status = "Audit Blocked"
                    await update_status("Audit Blocked")
                    await self._record_step(
                        action=f"Blocked: Anti-bot Challenge ({challenge_reason})",
                        url=self._page.url,
                        title=await self._page.title(),
                        is_challenge=True
                    )
                    break

                await update_status("Checking safety boundary")
                await asyncio.sleep(self.pacing_delay_sec)

                # 2. Safety Boundary Check
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

                # 3. Inspect Page for Next Safe Navigation Element
                await update_status("Inspecting page")
                safe_element, action_desc = await self._find_next_safe_action()

                if not safe_element:
                    # Scroll down to observe progressive disclosure
                    await update_status("Navigating")
                    scroll_info = await self.scroll(direction="down", distance_px=600)
                    if scroll_info.get("scrolled", True):
                        await update_status("Capturing screen")
                        await self._record_step(
                            action="Page Scroll Inspection",
                            url=self._page.url,
                            title=await self._page.title()
                        )
                    break

                # 4. Perform Safe Interaction
                await update_status("Navigating")
                logger.info(f"[{self.audit_id}] Performing safe action: {action_desc}")
                
                pages_before = set(self._context.pages) if self._context else set()
                try:
                    await safe_element.click(timeout=self.action_timeout_ms)
                    await asyncio.sleep(0.5)
                except Exception as click_err:
                    logger.warning(f"[{self.audit_id}] Click timed out or intercepted: {click_err}")
                    try:
                        await safe_element.click(timeout=2000, force=True)
                    except Exception:
                        pass

                # Check if a new tab opened
                if self._context:
                    pages_after = set(self._context.pages)
                    new_pages = pages_after - pages_before
                    if new_pages:
                        latest_page = list(new_pages)[-1]
                        if not latest_page.is_closed():
                            self._page = latest_page
                            logger.info(f"[{self.audit_id}] Switched active page to newly opened tab: {self._page.url}")

                try:
                    await self._page.wait_for_load_state("domcontentloaded", timeout=self.nav_timeout_ms)
                    try:
                        await self._page.wait_for_load_state("networkidle", timeout=2500)
                    except Exception:
                        pass
                    await asyncio.sleep(self.pacing_delay_sec)
                except Exception:
                    pass

                self.current_url = self._page.url
                self.current_title = await self._page.title()
                if self.current_url not in self.visited_urls:
                    self.visited_urls.append(self.current_url)

                # 5. Check Challenge immediately after click
                is_challenge, challenge_reason = await self.check_security_challenge()
                if is_challenge:
                    self.is_blocked = True
                    self.block_reason = f"Target site presented an anti-bot/security verification challenge ({challenge_reason}). VISH does not bypass security challenges, so the target could not be reliably analyzed."
                    logger.warning(f"[{self.audit_id}] AUDIT BLOCKED POST-ACTION: {self.block_reason}")
                    self.status = "Audit Blocked"
                    await update_status("Audit Blocked")
                    await self._record_step(
                        action=f"Blocked: Anti-bot Challenge ({challenge_reason})",
                        url=self.current_url,
                        title=self.current_title,
                        is_challenge=True
                    )
                    break

                # 6. Check Safety immediately after click
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

                # 7. Capture Step Screenshot
                await update_status("Capturing screen")
                await self._record_step(
                    action=action_desc,
                    url=self.current_url,
                    title=self.current_title
                )

            if not self.is_blocked:
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
        Scans visible buttons, forms, and inputs for payment charge or credit card submission triggers.
        Returns (is_payment_detected, matching_term).
        """
        if not self._page:
            return False, ""

        try:
            # 1. Query visible interactive elements
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

            # 2. Query payment input selectors (credit card number, cvv, payment iframes)
            for sel in self.PAYMENT_INPUT_SELECTORS:
                try:
                    input_el = await self._page.query_selector(sel)
                    if input_el and await input_el.is_visible():
                        return True, f"Payment input field or iframe detected ('{sel}')"
                except Exception:
                    continue

            # 3. Check page URL for final payment completion endpoints
            current_url_lower = self._page.url.lower()
            if any(marker in current_url_lower for marker in ["/pay/confirm", "/order/confirm", "/checkout/review", "/payment/process", "/billing/pay"]):
                return True, f"URL endpoint '{self._page.url}' indicates payment flow"

            return False, ""
        except Exception as e:
            logger.warning(f"Error checking payment safety: {e}")
            return False, ""

    async def check_security_challenge(self) -> Tuple[bool, str]:
        """
        Scans page title, body text, and DOM elements for anti-bot / security challenge signals
        (e.g., Cloudflare Turnstile, reCAPTCHA, PerimeterX/HUMAN, Datadome, Kasada).
        Returns (is_challenge_detected, matched_detail).
        """
        if not self._page or self._page.is_closed():
            return False, ""

        try:
            # 1. Inspect page title
            title = ""
            try:
                title = (await self._page.title() or "").strip()
            except Exception:
                pass

            title_lower = title.lower()
            for kw in self.CHALLENGE_TITLE_KEYWORDS:
                if kw in title_lower:
                    return True, f"Challenge title: '{title}' matched keyword '{kw}'"

            # 2. Inspect known challenge selectors / iframes / elements
            for sel in self.CHALLENGE_SELECTORS:
                try:
                    el = await self._page.query_selector(sel)
                    if el:
                        try:
                            vis = await el.is_visible()
                            if vis:
                                return True, f"Challenge element '{sel}' detected and visible"
                        except Exception:
                            if "challenge" in sel or "recaptcha" in sel or "turnstile" in sel:
                                return True, f"Challenge element '{sel}' present in DOM"
                except Exception:
                    continue

            # 3. Inspect visible text on page (body text)
            try:
                body_el = await self._page.query_selector("body")
                if body_el:
                    body_text = (await body_el.inner_text() or "").lower()
                    body_sample = body_text[:3000]
                    for kw in self.CHALLENGE_BODY_KEYWORDS:
                        if kw in body_sample:
                            return True, f"Challenge keyword '{kw}' found in page body"
            except Exception:
                pass

            return False, ""
        except Exception as e:
            logger.warning(f"Error checking security challenge: {e}")
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
        Finds the next safe, non-destructive navigation action prioritizing meaningful user flows:
        1. Signup / registration
        2. Search / product-selection flow
        3. Add/select item
        4. Checkout progression
        5. Cancellation/account-management flow when publicly accessible
        6. Relevant navigation tabs
        7. Other meaningful buttons/links
        """
        if not self._page:
            return None, ""

        current_host = urllib.parse.urlparse(self.current_url).netloc
        # Base registered domain (e.g. agoda.com from www.agoda.com)
        parts = current_host.split('.')
        base_domain = '.'.join(parts[-2:]) if len(parts) >= 2 else current_host

        # Dismiss common floating promo modals/dialogs if present to unblock navigation
        try:
            close_btn = await self._page.query_selector(
                "button[aria-label='Close'], button[data-selenium='prominent-app-download-floating-button'], button.modal-close, [aria-label*='dismiss' i]"
            )
            if close_btn and await close_btn.is_visible():
                await close_btn.click(timeout=1500)
                await asyncio.sleep(0.4)
        except Exception:
            pass

        tiers = [
            ("1_SIGNUP", self.SIGNUP_KEYWORDS, self.SIGNUP_SELECTORS),
            ("2_SEARCH", self.SEARCH_KEYWORDS, self.SEARCH_SELECTORS),
            ("3_SELECT_ITEM", self.ITEM_KEYWORDS, self.ITEM_SELECTORS),
            ("4_CHECKOUT", self.CHECKOUT_PROGRESSION_KEYWORDS, self.CHECKOUT_SELECTORS),
            ("5_CANCELLATION", self.CANCELLATION_KEYWORDS, self.CANCELLATION_SELECTORS),
            ("6_CATEGORY_TABS", self.CATEGORY_KEYWORDS, self.CATEGORY_SELECTORS),
            ("7_OTHER_BENIGN", self.OTHER_KEYWORDS, [])
        ]

        def match_tokens(text: str, keywords: List[str]) -> bool:
            t_lower = text.lower()
            words = set(re.findall(r'\b\w+\b', t_lower))
            for kw in keywords:
                if " " in kw or "-" in kw:
                    if kw in t_lower:
                        return True
                else:
                    if kw in words:
                        return True
            return False

        try:
            buttons = await self._page.query_selector_all("button, [role='button'], input[type='submit'], input[type='button']")
            links = await self._page.query_selector_all("a[href]")

            for tier_name, keywords, selectors in tiers:
                # 1. Check buttons for this tier
                for b in buttons:
                    try:
                        if not await b.is_visible():
                            continue
                        txt = (await b.inner_text() or "").strip()
                        aria = (await b.get_attribute("aria-label") or "").strip()
                        testid = (await b.get_attribute("data-selenium") or await b.get_attribute("data-element-name") or "").strip()
                        btn_id = (await b.get_attribute("id") or "").strip()
                        combined_text = f"{txt} {aria}".strip().lower()

                        # Safety: never click payment charge triggers
                        if any(p in combined_text for p in self.PAYMENT_KEYWORDS):
                            continue

                        # Deduplication signature
                        sig = f"btn:{btn_id or testid or txt[:35] or aria[:35]}"
                        if sig in self.performed_actions:
                            continue

                        # Match
                        matched = match_tokens(combined_text, keywords)
                        if not matched and selectors:
                            for sel in selectors:
                                try:
                                    if await b.matches(sel):
                                        matched = True
                                        break
                                except Exception:
                                    pass

                        if matched:
                            self.performed_actions.append(sig)
                            return b, f"[{tier_name}] Click button '{txt or aria or testid or 'action'}'"
                    except Exception:
                        continue

                # 2. Check links for this tier
                for link in links:
                    try:
                        if not await link.is_visible():
                            continue
                        href = (await link.get_attribute("href") or "").strip()
                        txt = (await link.inner_text() or "").strip()
                        aria = (await link.get_attribute("aria-label") or "").strip()
                        combined_text = f"{txt} {aria}".strip().lower()

                        # Avoid anchor fragments, javascript, mailto, tel
                        if href.startswith("#") or href.startswith("javascript:") or href.startswith("mailto:") or href.startswith("tel:"):
                            continue

                        # Strict domain enforcement: must be relative or same registered domain
                        if href.startswith("http://") or href.startswith("https://"):
                            link_host = urllib.parse.urlparse(href).netloc
                            if base_domain not in link_host:
                                continue

                        # Safety: never click payment charge triggers
                        if any(p in combined_text for p in self.PAYMENT_KEYWORDS):
                            continue

                        # Deduplication signature
                        sig = f"link:{href.split('?')[0]}:{txt[:25]}"
                        if sig in self.performed_actions:
                            continue

                        # Match
                        matched = match_tokens(combined_text, keywords)
                        if not matched and selectors:
                            for sel in selectors:
                                try:
                                    if await link.matches(sel):
                                        matched = True
                                        break
                                except Exception:
                                    pass

                        # Path keywords in href
                        if not matched and tier_name == "2_SEARCH":
                            if any(path_kw in href.lower() for path_kw in ["/city/", "/search?", "/properties", "/listings"]):
                                matched = True

                        if not matched and tier_name == "3_SELECT_ITEM":
                            if any(path_kw in href.lower() for path_kw in ["/hotel/", "/room/", "/deal/"]):
                                matched = True

                        if matched:
                            self.performed_actions.append(sig)
                            return link, f"[{tier_name}] Click link '{txt or href[:40]}'"
                    except Exception:
                        continue

            return None, ""
        except Exception as e:
            logger.warning(f"Error finding safe action: {e}")
            return None, ""

    async def scroll(self, direction: str = "down", distance_px: int = 500) -> Dict[str, Any]:
        """Scrolls the page smoothly."""
        if not self._page:
            return {}
        
        delta = distance_px if direction == "down" else -distance_px
        try:
            prev_y = await self._page.evaluate("window.scrollY || window.pageYOffset || 0")
            await self._page.evaluate(f"window.scrollBy({{ top: {delta}, behavior: 'smooth' }});")
            await asyncio.sleep(self.pacing_delay_sec)
            new_y = await self._page.evaluate("window.scrollY || window.pageYOffset || 0")
            scrolled = abs(new_y - prev_y) > 5
        except Exception:
            scrolled = False
        return {"action": "scroll", "direction": direction, "distance": distance_px, "scrolled": scrolled}

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
        stopped_for_safety: bool = False,
        is_challenge: bool = False
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
            status="Blocked" if is_challenge else "Captured",
            payment_detected=payment_detected,
            stopped_for_safety=stopped_for_safety,
            is_challenge=is_challenge,
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
