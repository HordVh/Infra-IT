from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ForecastResult(BaseModel):
    model: str
    current_stock: float
    predicted_demand: float


class InventoryStatusItem(BaseModel):
    model: str
    status: str  # "CRITICAL" | "LOW" | "OK"
    reason: str
    current_stock: float
    predicted_demand: float


class HardwareEvalResult(BaseModel):
    candidate_model: str
    cost: Optional[float] = None
    vs_inventory_avg_cost: Optional[float] = None
    cost_delta_pct: Optional[float] = None
    spec_summary: Dict[str, Any] = Field(default_factory=dict)
    ai_assessment: str


class DraftPurchaseOrder(BaseModel):
    po_id: str
    model: str
    suggested_quantity: int
    unit_cost: float
    total_cost: float
    trigger_reason: str
    status: str = "PENDING_APPROVAL"
    generated_at: str
    ai_justification: Optional[str] = None


class UploadPreview(BaseModel):
    hardware_requests: list[Dict[str, Any]]
    current_inventory: list[Dict[str, Any]]
    candidate_products: list[Dict[str, Any]]
