import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, status

from app.schemas.audit import (
    Audit, 
    AuditCreateRequest, 
    AuditStatus, 
    AuditResult, 
    AuditStep, 
    Detection, 
    AuditType,
    DarkPatternType
)
from app.services.friction_engine import FrictionEngine
from app.services.receipt_generator import ReceiptGenerator
from app.services.browser_agent import BrowserAgent, validate_url, InvalidUrlError
from app.services.vision_analyzer import VisionAnalyzer

logger = logging.getLogger("vish.api")

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

router = APIRouter()

# In-memory storage for MVP
AUDITS_DB: Dict[str, Audit] = {}
RESULTS_DB: Dict[str, AuditResult] = {}
LIVE_STEPS_DB: Dict[str, List[AuditStep]] = {}

# Pre-populate PPT Demo Audits
demo_dark = ReceiptGenerator.generate_demo_receipt("dark_pattern_flow")
demo_honest = ReceiptGenerator.generate_demo_receipt("honest_flow")
demo_average = ReceiptGenerator.generate_demo_receipt("industry_average_flow")

RESULTS_DB["demo_dark_pattern_flow"] = demo_dark
RESULTS_DB["demo_honest_flow"] = demo_honest
RESULTS_DB["demo_industry_average"] = demo_average

AUDITS_DB["demo_dark_pattern_flow"] = Audit(
    id="demo_dark_pattern_flow",
    url=demo_dark.url,
    audit_type=demo_dark.audit_type,
    status=AuditStatus.COMPLETE,
    created_at=demo_dark.created_at,
    completed_at=demo_dark.completed_at,
    friction_score=demo_dark.friction_score,
    is_demo=True,
    is_live_crawl=False,
    vision_source="demo"
)

AUDITS_DB["demo_honest_flow"] = Audit(
    id="demo_honest_flow",
    url=demo_honest.url,
    audit_type=demo_honest.audit_type,
    status=AuditStatus.COMPLETE,
    created_at=demo_honest.created_at,
    completed_at=demo_honest.completed_at,
    friction_score=demo_honest.friction_score,
    is_demo=True,
    is_live_crawl=False,
    vision_source="demo"
)

AUDITS_DB["demo_industry_average"] = Audit(
    id="demo_industry_average",
    url=demo_average.url,
    audit_type=demo_average.audit_type,
    status=AuditStatus.COMPLETE,
    created_at=demo_average.created_at,
    completed_at=demo_average.completed_at,
    friction_score=demo_average.friction_score,
    is_demo=True,
    is_live_crawl=False,
    vision_source="demo"
)


async def run_live_browser_audit(audit_id: str, url: str, audit_type: AuditType):
    """
    Background worker:
    1. Launches controlled Playwright Chromium.
    2. Navigates target URL, capturing real viewport screenshots.
    3. Respects safety boundaries (stopping before payment).
    4. Analyzes screenshots using Gemini Vision (or clean mock fallback).
    5. Calculates Friction Score using FrictionEngine and generates receipt.
    """
    agent = BrowserAgent()
    vision_analyzer = VisionAnalyzer()
    vision_source = "gemini_vision" if vision_analyzer.has_real_ai else "mock"
    AUDITS_DB[audit_id].vision_source = vision_source

    try:
        # Step 1: Open website & Initial capture
        AUDITS_DB[audit_id].status = AuditStatus.OPENING
        logger.info(f"[{audit_id}] Starting live browser audit on {url} (Vision Source: {vision_source})")
        
        await agent.start_audit(url, audit_id)
        LIVE_STEPS_DB[audit_id] = list(agent.steps)

        # Progress update callback
        async def on_status_change(new_status: str, step_counter: int, current_url: str):
            if new_status != "Complete":
                AUDITS_DB[audit_id].status = AuditStatus(new_status)
            else:
                AUDITS_DB[audit_id].status = AuditStatus.ANALYZING
            LIVE_STEPS_DB[audit_id] = list(agent.steps)

        # Step 2: Controlled browser navigation
        steps = await agent.run_controlled_audit(on_status_change)
        LIVE_STEPS_DB[audit_id] = list(steps)

        # Step 3: Analyze captured screenshots with Gemini Vision
        AUDITS_DB[audit_id].status = AuditStatus.ANALYZING
        detections: List[Detection] = []

        try:
            seen_screenshots = set()
            for s in steps:
                AUDITS_DB[audit_id].status = AuditStatus.ANALYZING
                if s.screenshot and s.screenshot not in seen_screenshots:
                    seen_screenshots.add(s.screenshot)
                    logger.info(f"[{audit_id}] Analyzing screenshot for Step #{s.step_number} ({s.screenshot})")
                    step_dets = await vision_analyzer.analyze_screenshot(
                        screenshot_path=s.screenshot,
                        page_url=s.url,
                        page_title=s.title,
                        step_number=s.step_number
                    )
                    if step_dets:
                        AUDITS_DB[audit_id].status = AuditStatus.DETECTING
                        detections.extend(step_dets)
        except Exception as vision_err:
            logger.error(f"[{audit_id}] Vision analysis encountered an error: {vision_err}", exc_info=True)
            vision_source = "unavailable"
            AUDITS_DB[audit_id].vision_source = "unavailable"

        # Step 4: Friction Engine & Receipt Generation
        AUDITS_DB[audit_id].status = AuditStatus.GENERATING
        receipt = ReceiptGenerator.generate_receipt(
            audit_id=audit_id,
            url=url,
            audit_type=audit_type,
            steps=steps,
            detections=detections,
            is_demo=False,
            created_at=AUDITS_DB[audit_id].created_at,
            vision_source=vision_source
        )

        receipt.is_live_crawl = True
        receipt.payment_detected = agent.payment_detected
        receipt.stopped_for_safety = agent.stopped_for_safety

        source_desc = "Real Gemini Vision AI" if vision_source == "gemini_vision" else "Step 3 Mock Vision Fallback"
        if agent.stopped_for_safety:
            receipt.score_summary = (
                f"[LIVE BROWSER EVIDENCE] Playwright agent audited {len(steps)} steps on {url}. "
                f"SAFETY GUARD ENFORCED: Stopped before final payment confirmation. "
                f"Vision Analysis ({source_desc}): {len(detections)} dark patterns detected. "
                f"Friction Score: {receipt.friction_score}/45."
            )
        else:
            receipt.score_summary = (
                f"[LIVE BROWSER EVIDENCE] Playwright agent audited {len(steps)} steps on {url}. "
                f"Vision Analysis ({source_desc}): {len(detections)} dark patterns detected. "
                f"Friction Score: {receipt.friction_score}/45."
            )

        RESULTS_DB[audit_id] = receipt
        AUDITS_DB[audit_id].status = AuditStatus.COMPLETE
        AUDITS_DB[audit_id].completed_at = utc_now()
        AUDITS_DB[audit_id].friction_score = receipt.friction_score
        AUDITS_DB[audit_id].payment_detected = agent.payment_detected
        AUDITS_DB[audit_id].stopped_for_safety = agent.stopped_for_safety
        logger.info(f"[{audit_id}] Live audit and vision analysis completed successfully.")

    except Exception as e:
        logger.error(f"[{audit_id}] Live browser audit failed: {e}", exc_info=True)
        AUDITS_DB[audit_id].status = AuditStatus.FAILED
        AUDITS_DB[audit_id].error_message = str(e)
        AUDITS_DB[audit_id].completed_at = utc_now()
        if agent.steps:
            LIVE_STEPS_DB[audit_id] = list(agent.steps)


@router.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for VISH backend."""
    vision_analyzer = VisionAnalyzer()
    return {
        "status": "healthy",
        "service": "VISH — Dark Pattern Auditor API",
        "step": "Step 3 Gemini Vision Screenshot Analysis",
        "gemini_configured": vision_analyzer.has_real_ai,
        "gemini_model": vision_analyzer.model_name if vision_analyzer.has_real_ai else None,
        "supported_categories": [
            DarkPatternType.HIDDEN_COST.value,
            DarkPatternType.FORCED_REAUTH.value,
            DarkPatternType.CONFIRMSHAMING.value,
            DarkPatternType.ROACH_MOTEL.value
        ],
        "timestamp": utc_now().isoformat()
    }


@router.post("/audits", response_model=Audit, status_code=status.HTTP_201_CREATED, tags=["Audits"])
async def create_audit(request: AuditCreateRequest, background_tasks: BackgroundTasks):
    """
    Creates an audit session.
    - If is_demo=True: returns pre-calibrated PPT demo flow.
    - If real URL: validates URL, launches Playwright + Gemini in background task, and returns immediately.
    """
    if request.is_demo:
        flow_id = request.demo_flow_id or "dark_pattern_flow"
        if flow_id == "honest_flow":
            return AUDITS_DB["demo_honest_flow"]
        elif flow_id == "industry_average_flow":
            return AUDITS_DB["demo_industry_average"]
        else:
            return AUDITS_DB["demo_dark_pattern_flow"]

    # Validate URL
    try:
        valid_url = validate_url(request.url)
    except InvalidUrlError as err:
        raise HTTPException(status_code=400, detail=str(err))

    audit_id = f"audit_{uuid.uuid4().hex[:8]}"
    new_audit = Audit(
        id=audit_id,
        url=valid_url,
        audit_type=request.audit_type,
        status=AuditStatus.OPENING,
        created_at=utc_now(),
        friction_score=0,
        is_demo=False,
        is_live_crawl=True,
        vision_source="pending"
    )
    
    AUDITS_DB[audit_id] = new_audit
    LIVE_STEPS_DB[audit_id] = []

    # Queue background browser execution
    background_tasks.add_task(run_live_browser_audit, audit_id, valid_url, request.audit_type)

    return new_audit


@router.get("/audits/{audit_id}", response_model=Audit, tags=["Audits"])
async def get_audit(audit_id: str):
    """Fetches metadata for a specific audit."""
    if audit_id not in AUDITS_DB:
        raise HTTPException(status_code=404, detail="Audit not found")
    return AUDITS_DB[audit_id]


@router.get("/audits/{audit_id}/status", tags=["Audits"])
async def get_audit_status(audit_id: str):
    """
    Returns live browser agent progress and recorded steps.
    """
    if audit_id not in AUDITS_DB:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    audit = AUDITS_DB[audit_id]
    steps = LIVE_STEPS_DB.get(audit_id, [])
    latest_step = steps[-1] if steps else None

    # Step progression index
    current_idx = 1
    if audit.status == AuditStatus.COMPLETE:
        current_idx = 6
    elif audit.status in (AuditStatus.OPENING, AuditStatus.NAVIGATING):
        current_idx = min(2, len(steps) + 1)
    elif audit.status == AuditStatus.CAPTURING:
        current_idx = 3
    elif audit.status in (AuditStatus.INSPECTING, AuditStatus.ANALYZING):
        current_idx = 4
    elif audit.status == AuditStatus.DETECTING:
        current_idx = 5
    elif audit.status == AuditStatus.CHECKING_SAFETY:
        current_idx = 5
    elif audit.status == AuditStatus.GENERATING:
        current_idx = 6

    return {
        "id": audit.id,
        "url": audit.url,
        "status": audit.status.value,
        "current_step_index": current_idx,
        "step_count": len(steps),
        "friction_score": audit.friction_score,
        "latest_step": latest_step.model_dump() if latest_step else None,
        "payment_detected": audit.payment_detected,
        "stopped_for_safety": audit.stopped_for_safety,
        "vision_source": audit.vision_source,
        "error_message": audit.error_message,
        "is_demo": audit.is_demo,
        "is_live_crawl": audit.is_live_crawl,
        "timestamp": utc_now().isoformat()
    }


@router.get("/audits/{audit_id}/results", response_model=AuditResult, tags=["Audits"])
async def get_audit_results(audit_id: str):
    """
    Fetches the itemized audit receipt, recorded browser steps, and vision detections.
    """
    if audit_id in RESULTS_DB:
        return RESULTS_DB[audit_id]
    
    if audit_id not in AUDITS_DB:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    audit = AUDITS_DB[audit_id]
    if audit.status == AuditStatus.FAILED:
        raise HTTPException(status_code=400, detail=f"Audit failed: {audit.error_message or 'Unknown error'}")
    
    if audit.status != AuditStatus.COMPLETE:
        raise HTTPException(status_code=202, detail="Audit is still in progress")

    raise HTTPException(status_code=404, detail="Results not ready")


@router.get("/comparison", tags=["Comparison"])
async def get_comparison_benchmarks():
    """
    Returns reference/demo values from PPT Page 8:
    - Known dark-pattern flow: 37 / 45
    - Industry-average flow: 18 / 45 (stretch goal)
    - Honest / one-click flow: 6 / 45
    """
    return {
        "title": "TARGET FRICTION SCORES — TWO FLOWS WE'LL PROVE LIVE",
        "scale": "0–45",
        "rubric_source": "PPT Page 8 (Solid bars hand-scored against fixed rubric; average is stretch goal)",
        "benchmarks": [
            {
                "id": "dark_pattern",
                "label": "Known dark-pattern flow",
                "score": 37,
                "type": "hand_scored_target",
                "flow_id": "demo_dark_pattern_flow",
                "color": "#FF5733"
            },
            {
                "id": "industry_average",
                "label": "Industry-average flow",
                "score": 18,
                "type": "stretch_goal_reference",
                "flow_id": "demo_industry_average",
                "color": "#E25241"
            },
            {
                "id": "honest",
                "label": "Honest / one-click flow",
                "score": 6,
                "type": "hand_scored_target",
                "flow_id": "demo_honest_flow",
                "color": "#FF6B4A"
            }
        ]
    }


@router.get("/rubric", tags=["Rubric"])
async def get_rubric():
    """Returns the published fixed rubric from PPT Page 3."""
    return FrictionEngine.get_rubric_documentation()
