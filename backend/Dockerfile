# Production Dockerfile for VISH Backend (when Root Directory is set to /backend)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    PYTHONPATH=/app

WORKDIR /app

# Install system utilities needed for Playwright browser dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install backend Python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser and its Linux OS system dependencies
RUN playwright install --with-deps chromium

# Copy backend application source code
COPY . .

# Ensure screenshots directory exists
RUN mkdir -p /app/data/screenshots

EXPOSE 8000

# Start command listening on 0.0.0.0 and dynamic $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
