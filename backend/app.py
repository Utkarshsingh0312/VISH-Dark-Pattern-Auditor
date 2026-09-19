"""
VISH FastAPI Backend Application
Provides REST & SSE APIs for live dark pattern flow auditing, mock site hosting,
and screenshot delivery.
"""

import os
import json
import asyncio
from typing import Dict, Any
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from browser_agent import PlaywrightAuditAgent
from friction_engine import TAXONOMY_RUBRIC, FrictionEngine, AuditReceipt

app = FastAPI(title="VISH Dark Pattern Auditor", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")
MOCK_DIR = os.path.join(BASE_DIR, "mock_sites")
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)
os.makedirs(MOCK_DIR, exist_ok=True)

# Mount screenshot & mock sites static files
app.mount("/screenshots", StaticFiles(directory=SCREENSHOT_DIR), name="screenshots")
app.mount("/mock", StaticFiles(directory=MOCK_DIR), name="mock")

# Active audit event queues for live streaming
active_audits: Dict[str, asyncio.Queue] = {}
audit_results: Dict[str, AuditReceipt] = {}

class AuditRequest(BaseModel):
    url: str
    preset: str = ""

@app.get("/api/presets")
def get_presets():
    host_base = "http://127.0.0.1:8000"
    return [
        {
            "id": "dark_pattern",
            "name": "Deceptive Checkout Flow (EvilCart)",
            "subtitle": "Contains Hidden Cost ($4.99), Confirmshaming, Pre-selected Add-on, Forced Re-auth",
            "url": f"{host_base}/mock/evil_cart.html",
            "benchmark_score": 37
        },
        {
            "id": "honest_flow",
            "name": "Transparent 1-Click Flow (HonestStore)",
            "subtitle": "Clean pricing, clear opt-ins, transparent cancellation policy",
            "url": f"{host_base}/mock/honest_store.html",
            "benchmark_score": 6
        },
        {
            "id": "industry_avg",
            "name": "Industry-Average Benchmark Flow",
            "subtitle": "Standard ecommerce baseline with minor friction",
            "url": f"{host_base}/mock/honest_store.html",
            "benchmark_score": 18
        }
    ]

@app.get("/api/rubric")
def get_rubric():
    return TAXONOMY_RUBRIC

@app.post("/api/audit")
async def start_audit(req: AuditRequest, background_tasks: BackgroundTasks):
    target_url = req.url.strip()
    
    # Handle preset shortcut URLs
    if req.preset == "dark_pattern" or "evil" in target_url:
        target_url = f"http://127.0.0.1:8000/mock/evil_cart.html"
    elif req.preset == "honest_flow" or "honest" in target_url:
        target_url = f"http://127.0.0.1:8000/mock/honest_store.html"
    
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "http://" + target_url

    event_queue = asyncio.Queue()
    agent = PlaywrightAuditAgent(SCREENSHOT_DIR)

    async def progress_callback(event: Dict[str, Any]):
        await event_queue.put(event)

    async def run_audit_task():
        try:
            receipt = await agent.audit_flow(target_url, progress_callback)
            audit_id = receipt.audit_id
            audit_results[audit_id] = receipt
            await event_queue.put({"status": "FINISHED", "receipt": receipt.model_dump()})
        except Exception as e:
            await event_queue.put({"status": "ERROR", "details": str(e)})

    # Launch audit in background task
    asyncio.create_task(run_audit_task())

    # Return initial status
    return {"status": "started", "target_url": target_url}

@app.get("/api/audit/stream")
async def stream_audit(url: str, req: Request):
    """
    SSE stream endpoint for real-time live browser navigation feed.
    """
    target_url = url.strip()
    if "evil" in target_url or "dark_pattern" in target_url:
        target_url = f"http://127.0.0.1:8000/mock/evil_cart.html"
    elif "honest" in target_url:
        target_url = f"http://127.0.0.1:8000/mock/honest_store.html"

    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "http://" + target_url

    async def event_generator():
        event_queue = asyncio.Queue()
        agent = PlaywrightAuditAgent(SCREENSHOT_DIR)

        async def callback(event: Dict[str, Any]):
            await event_queue.put(event)

        asyncio.create_task(agent.audit_flow(target_url, callback))

        while True:
            if await req.is_disconnected():
                break
            try:
                evt = await asyncio.wait_for(event_queue.get(), timeout=30.0)
                yield f"data: {json.dumps(evt)}\n\n"
                if evt.get("status") in ["completed", "FINISHED", "ERROR"]:
                    break
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'status': 'ping'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Mount frontend dist if built
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
