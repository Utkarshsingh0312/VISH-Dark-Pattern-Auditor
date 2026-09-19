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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Playwright Screenshots
app.mount("/api/screenshots", StaticFiles(directory=str(screenshots_path)), name="screenshots")

# Include API Router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to VISH — Dark Pattern Auditor API",
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_url": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
