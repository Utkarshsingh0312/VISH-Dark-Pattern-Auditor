import sys
import asyncio

if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

import uvicorn
from app.main import app

def run():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info", loop="asyncio")

if __name__ == "__main__":
    run()
