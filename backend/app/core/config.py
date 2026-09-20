import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "VISH — Dark Pattern Auditor"
    TAGLINE: str = "Every dark pattern, caught in the act."
    API_PREFIX: str = "/api"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "*"

    # Gemini Vision AI Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    GEMINI_CONFIDENCE_THRESHOLD: float = 0.80
    GEMINI_TIMEOUT_SEC: float = 25.0

    # Browser Automation Settings (Playwright)
    BROWSER_HEADLESS: bool = True
    VIEWPORT_WIDTH: int = 1280
    VIEWPORT_HEIGHT: int = 800
    NAV_TIMEOUT_MS: int = 25000
    ACTION_TIMEOUT_MS: int = 8000
    MAX_PAGES: int = 5
    MAX_ACTIONS: int = 10
    MAX_SCREENSHOTS: int = 6
    PACING_DELAY_SEC: float = 0.8
    
    # Storage Directory for Viewport Screenshots
    SCREENSHOTS_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "screenshots")

    model_config = SettingsConfigDict(
        env_file=[
            str(Path(__file__).resolve().parent.parent.parent / ".env"),
            str(Path(__file__).resolve().parent.parent.parent.parent / ".env"),
            ".env"
        ],
        extra="ignore"
    )

settings = Settings()
