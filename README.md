# Infra IT

An AI-powered IT procurement and inventory management prototype built with **Next.js** and **Python FastAPI**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Recharts |
| Backend | Python FastAPI, pandas, openpyxl |
| AI | Llama 3 (via OllamaFreeAPI) |
| Fonts | DM Sans, DM Mono (Google Fonts) |

---

## Prerequisites

- **Python 3.10+** — [Download here](https://www.python.org/downloads/)
- **Node.js 18+** — [Download here](https://nodejs.org/)
- **Ollama running locally** — [Download here](https://ollama.com/)

After installing Ollama, pull the required models:

```bash
ollama pull llama3.2:3b
ollama pull llama3:latest
```

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
│   │   ├── ai_client.py         # Shared Llama 3 client (OllamaFreeAPI)
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

### 2. Start Ollama

Ensure the Ollama service is running before starting the backend:

```bash
ollama serve
```

### 3. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate sample Excel file
python create_sample_data.py

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 4. Frontend Setup

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

## AI Models

| Use case | Model | Notes |
|---|---|---|
| Hardware evaluation | `llama3.2:3b` | Batch assessment of all candidates in one call |
| PO justification | `llama3.2:3b` | One call per purchase order |
| Streaming (optional) | `llama3:latest` | Used via `generate_response(stream=True)` |

Both models are pulled from your local Ollama instance — no API key or internet connection required at runtime.

---

## Notes

- **In-memory state**: Uploaded DataFrames are stored in memory and reset on server restart
- **No authentication**: This is a prototype — no auth is implemented
- **AI graceful degradation**: If the Ollama service is unreachable, AI endpoints return a placeholder message instead of failing
