import sys
import asyncio

# On Windows, Playwright requires ProactorEventLoop to support subprocesses
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.routes import router as api_router

# Ensure screenshots directory exists
screenshots_path = Path(settings.SCREENSHOTS_DIR)
screenshots_path.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for VISH — Dark Pattern Auditor. Drives real Playwright browser agent, captures viewport screenshots, checks safety boundaries, and computes Friction Score receipts.",
    version="1.1.0-step2"
)

# Configure CORS (supports local dev, explicit CORS_ORIGINS, FRONTEND_URL, and all deployed Vercel origins)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_url = getattr(settings, "FRONTEND_URL", "").strip()
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

cors_origins_raw = getattr(settings, "CORS_ORIGINS", "*")
if cors_origins_raw and cors_origins_raw != "*":
    for orig in cors_origins_raw.split(","):
        orig_clean = orig.strip()
        if orig_clean and orig_clean not in allowed_origins:
            allowed_origins.append(orig_clean)
elif cors_origins_raw == "*":
    if "*" not in allowed_origins:
        allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Playwright Screenshots and Mock Test Sites
app.mount("/api/screenshots", StaticFiles(directory=str(screenshots_path)), name="screenshots")
mock_sites_path = Path(__file__).resolve().parent.parent / "mock_sites"
if mock_sites_path.exists():
    app.mount("/api/mock_sites", StaticFiles(directory=str(mock_sites_path)), name="mock_sites")

# Include API Router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/health", tags=["System"])
def health():
    """Lightweight healthcheck endpoint for Railway and container orchestrators."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.1.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to VISH — Dark Pattern Auditor API",
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_url": "/health"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", getattr(settings, "PORT", 8000)))
    host = os.environ.get("HOST", getattr(settings, "HOST", "0.0.0.0"))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
