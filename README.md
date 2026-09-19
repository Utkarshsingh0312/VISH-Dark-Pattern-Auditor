# VISH — Dark Pattern Auditor

> **"Every dark pattern, caught in the act."**

*VISH reconstructs the exact sequence of interface decisions that caused a user to pay more than they intended — and puts a fixed, published rubric behind the number.*

---

## 1. Project Overview & Architecture

VISH audits a website flow by driving a browser agent to navigate it like a real user, capturing screenshots, detecting dark patterns using a Vision-LLM (Gemini Flash), calculating an explainable **0–45 Friction Score**, and generating an itemized audit receipt.

### Core Workflow (PPT Page 4):
```text
PASTE LINK → AI BROWSER AGENT → SCREEN ANALYSIS → DARK-PATTERN DETECTION → FRICTION SCORE → ITEMIZED RECEIPT
```

### Stack Architecture:
```text
vish/
├── frontend/                     # React + Vite + Modern CSS Design System
│   ├── src/
│   │   ├── components/           # 17 Reusable modular components
│   │   ├── pages/                # Home (/), Audit (/audit), Results (/results/:id), Comparison (/comparison)
│   │   ├── services/api.js       # Backend REST client
│   │   ├── hooks/useAudit.js     # Live state & progression hook
│   │   └── App.jsx               # React Router shell
├── backend/                      # Python + FastAPI backend
│   ├── app/
│   │   ├── api/routes.py         # REST endpoints (/health, /audits, /status, /results, /comparison)
│   │   ├── core/config.py        # Settings & CORS configuration
│   │   ├── schemas/audit.py      # Pydantic models (Audit, AuditStep, Detection, AuditResult)
│   │   ├── services/
│   │   │   ├── browser_agent.py  # BrowserAgent class/interface with safety safeguards
│   │   │   ├── vision_analyzer.py# VisionAnalyzer (Gemini Flash abstraction + validation loop)
│   │   │   ├── friction_engine.py# FrictionEngine (0–45 published rubric from PPT)
│   │   │   └── receipt_generator.py # ReceiptGenerator (itemized receipt & impact)
│   │   └── main.py               # FastAPI entrypoint
├── tests/                        # Automated API & scoring verification
├── .env.example
└── README.md
```

---

## 2. Safety & Scope Design (PPT Pages 4 & 6)

VISH is engineered with non-negotiable safety guardrails:
1. **No Real Transactions**: The browser agent automatically stops before final payment confirmation on any checkout — it never submits a real purchase or charges a credit card.
2. **Respects Site Rules**: Runs at a human-like pace within published rate limits and robots.txt.
3. **Account Safety**: Authenticated flows (such as cancellation or account management) only run against an owner-provided test account.
4. **Disclosed Rubric**: Scores are published against a disclosed rubric (not asserted as subjective fact) with a 14-day dispute window.

---

## 3. Published Scoring Rubric (0–45 Scale)

| Pattern | Weight Basis | PPT Example |
| :--- | :--- | :--- |
| **Hidden Cost** | Reversible × monetary impact | $4.99 fee shown only at final confirmation |
| **Forced Re-auth** | Adds friction after cost is shown | Password re-entry required after fee appears |
| **Confirmshaming** | Coercive language on decline path | *"No thanks, I like paying full price"* |
| **Roach Motel** | Entry vs. exit effort asymmetry | One-click signup, phone-call-only cancellation |

### Reference Calibration Values (PPT Page 8):
- **Known dark-pattern flow**: **37 / 45**
- **Honest / one-click flow**: **6 / 45**
- **Industry-average flow**: **18 / 45** (stretch-goal comparison)

---

## 4. Setup & Running the Project

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup:
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: `http://localhost:8000` (Docs at `http://localhost:8000/docs`).

### Frontend Setup:
```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```
Frontend will be available at: `http://localhost:5173`.

---

## 5. Current MVP Status (Step 1 Foundation)

### Implemented in Step 1:
- [x] Complete project foundation and folder structure
- [x] Full React frontend shell with 4 connected routes (`/`, `/audit`, `/results/:id`, `/comparison`)
- [x] 17 modular UI components styled with the PPT dark compliance visual identity
- [x] FastAPI backend with health, audits, status, results, and benchmark endpoints
- [x] Service abstractions for `BrowserAgent`, `VisionAnalyzer`, `FrictionEngine`, and `ReceiptGenerator`
- [x] Pydantic data schemas strictly typed
- [x] Pre-calibrated demo flows (Target 37 for dark flow, Target 6 for honest flow)
- [x] Safety notice panels and scope restrictions
- [x] Automated test suite for backend scoring and endpoints
- [x] Live Playwright Chromium agent with safety stop boundaries
- [x] Real Gemini Vision AI analysis service with 0.80 confidence threshold and fallback
- [x] Itemized friction receipt with exact PPT scoring methodology

### Local Environment Setup (Gemini Vision AI):
1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Add your Google Gemini API key to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_CONFIDENCE_THRESHOLD=0.80
   ```
3. Never commit `backend/.env` (excluded automatically via `.gitignore`).
4. Start the backend: `python backend/run_server.py`.
5. Start the frontend: `cd frontend && npm run dev`.
