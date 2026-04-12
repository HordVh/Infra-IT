from fastapi import APIRouter, HTTPException

from data_store import data_store
from services.forecast_service import generate_forecast
from services.inventory_service import calculate_inventory_status
from services.po_service import generate_draft_po

router = APIRouter()


@router.post("/purchase-orders/generate")
def generate_purchase_orders():
    """
    Generates draft purchase orders for CRITICAL and LOW inventory items.
    Uses Claude to produce an AI justification narrative for each PO.
    Requires data to have been uploaded first via POST /upload.
    """
    inventory_df = data_store.get("current_inventory")
    candidate_df = data_store.get("candidate_products")

    if inventory_df is None or candidate_df is None:
        raise HTTPException(
            status_code=400,
            detail="No data loaded. Please upload an Excel file first.",
        )

    forecast_results = generate_forecast(inventory_df)
    status_list = calculate_inventory_status(inventory_df, forecast_results)
    draft_pos = generate_draft_po(status_list, candidate_df)
    return draft_pos
