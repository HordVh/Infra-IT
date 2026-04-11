import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import upload, inventory, forecast, purchase_orders, hardware_eval

app = FastAPI(
    title="IT Procurement Intelligence API",
    description="AI-powered IT procurement and inventory management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(inventory.router, tags=["Inventory"])
app.include_router(forecast.router, tags=["Forecast"])
app.include_router(purchase_orders.router, tags=["Purchase Orders"])
app.include_router(hardware_eval.router, tags=["Hardware Evaluation"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "IT Procurement Intelligence API"}
