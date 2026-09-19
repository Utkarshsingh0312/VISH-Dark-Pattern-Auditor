from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AuditType(str, Enum):
    SIGNUP = "Signup"
    CHECKOUT = "Checkout"
    CANCELLATION = "Cancellation / Account"

class AuditStatus(str, Enum):
    READY = "Ready to audit"
    OPENING = "Opening website"
    NAVIGATING = "Navigating"
    CAPTURING = "Capturing screen"
    INSPECTING = "Inspecting page"
    CHECKING_SAFETY = "Checking safety boundary"
    ANALYZING = "Analyzing screen"
    DETECTING = "Detecting patterns"
    CALCULATING = "Calculating score"
    GENERATING = "Generating receipt"
    COMPLETE = "Complete"
    FAILED = "Failed"

# The Four PPT Dark Pattern Categories (PPT Page 3 & 5)
class DarkPatternType(str, Enum):
    HIDDEN_COST = "Hidden Cost"
    FORCED_REAUTH = "Forced Re-auth"
    CONFIRMSHAMING = "Confirmshaming"
    ROACH_MOTEL = "Roach Motel"

class Detection(BaseModel):
    pattern_name: str
    step_number: int
    description: str  # Why it matters / reason
    evidence: str     # Quoted visible text / element
    location: Optional[str] = None  # Where in the viewport
    score_contribution: int = Field(default=0, ge=0, le=45)
    confidence: float = Field(..., ge=0.0, le=1.0)
    needs_human_review: bool = False
    analysis_source: str = "gemini_vision"  # "gemini_vision" | "mock" | "demo"
    is_real_ai: bool = False

class AuditStep(BaseModel):
    step_number: int
    url: str
    title: Optional[str] = None
    screenshot: Optional[str] = None
    screenshot_url: Optional[str] = None
    action: Optional[str] = None
    status: str
    payment_detected: bool = False
    stopped_for_safety: bool = False
    timestamp: datetime = Field(default_factory=utc_now)

class AuditCreateRequest(BaseModel):
    url: str
    audit_type: AuditType = AuditType.SIGNUP
    test_account_provided: bool = False
    is_demo: bool = False
    demo_flow_id: Optional[str] = None

class Audit(BaseModel):
    id: str
    url: str
    audit_type: AuditType
    status: AuditStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    friction_score: int = Field(default=0, ge=0, le=45)
    is_demo: bool = False
    is_live_crawl: bool = False
    payment_detected: bool = False
    stopped_for_safety: bool = False
    vision_source: str = "pending"  # "gemini_vision" | "mock" | "demo" | "unavailable"
    error_message: Optional[str] = None

class AuditResult(BaseModel):
    audit_id: str
    url: str
    audit_type: AuditType
    friction_score: int = Field(..., ge=0, le=45)
    detections: List[Detection] = []
    estimated_cost: float = 0.0
    estimated_time: int = 0
    steps: List[AuditStep] = []
    created_at: datetime
    completed_at: Optional[datetime] = None
    is_demo: bool = False
    is_live_crawl: bool = False
    payment_detected: bool = False
    stopped_for_safety: bool = False
    vision_source: str = "gemini_vision"  # "gemini_vision" | "mock" | "demo"
    error_message: Optional[str] = None
    score_summary: Optional[str] = None

# Structured schemas for parsing raw Gemini JSON output
class RawGeminiDetection(BaseModel):
    pattern_name: str
    detected: bool = True
    description: str
    evidence: str
    location: Optional[str] = None
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    needs_human_review: Optional[bool] = None

class RawGeminiVisionResponse(BaseModel):
    detections: List[RawGeminiDetection] = []
    page_summary: Optional[str] = None
