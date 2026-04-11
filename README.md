# Infra IT

An AI-powered IT procurement and inventory management prototype built with **Next.js** and **Python FastAPI**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Recharts |
| Backend | Python FastAPI, pandas, openpyxl |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Fonts | DM Sans, DM Mono (Google Fonts) |

---

## Prerequisites

- **Python 3.10+** — [Download here](https://www.python.org/downloads/)
- **Node.js 18+** — [Download here](https://nodejs.org/)
- **An Anthropic API key** — [Get one here](https://console.anthropic.com/)

---

## Project Structure

```
/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── data_store.py            # In-memory DataFrame store
│   ├── routers/                 # HTTP endpoints
│   │   ├── upload.py            # POST /upload
│   │   ├── inventory.py         # GET /inventory-status
│   │   ├── forecast.py          # GET /forecast
│   │   ├── hardware_eval.py     # POST /hardware-eval
│   │   └── purchase_orders.py   # POST /purchase-orders/generate
│   ├── services/                # Business logic
│   │   ├── forecast_service.py
│   │   ├── inventory_service.py
│   │   ├── hardware_eval_service.py
│   │   └── po_service.py
│   ├── models/schemas.py        # Pydantic schemas
│   ├── create_sample_data.py    # Generates sample_data.xlsx
│   └── requirements.txt
└── frontend/
    ├── app/                     # Next.js pages
    ├── components/              # Reusable UI components
    └── lib/api.ts               # Typed API client
```

---

## Setup & Running

### 1. Install Python

Download and install Python 3.10+ from https://www.python.org/downloads/

Make sure to check **"Add python.exe to PATH"** during installation.

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Anthropic API key
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Generate sample Excel file
python create_sample_data.py

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 3. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:3000

---

## Usage

1. Open http://localhost:3000
2. Upload `backend/sample_data.xlsx` using the upload panel
3. Navigate to **Inventory Status** to see stock levels and demand forecast
4. Navigate to **Hardware Evaluation** to run AI analysis on candidate products
5. Navigate to **Purchase Orders** to generate AI-justified draft POs

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/upload` | Upload `.xlsx` inventory file |
| `GET` | `/inventory-status` | Get enriched status for all models |
| `GET` | `/forecast` | Get raw forecast data |
| `POST` | `/hardware-eval` | Run AI hardware evaluation |
| `POST` | `/purchase-orders/generate` | Generate draft purchase orders |

---

## Notes

- **In-memory state**: Uploaded DataFrames are stored in memory and reset on server restart
- **No authentication**: This is a prototype — no auth is implemented
- **AI graceful degradation**: If `ANTHROPIC_API_KEY` is not set, AI endpoints return a placeholder message instead of failing
