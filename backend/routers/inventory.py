from fastapi import APIRouter, HTTPException

from data_store import data_store
from services.forecast_service import generate_forecast
from services.inventory_service import calculate_inventory_status

router = APIRouter()


@router.get("/inventory-status")
def get_inventory_status():
    """
    Returns enriched inventory status (CRITICAL / LOW / OK) for every model.
    Requires data to have been uploaded first via POST /upload.
    """
    df = data_store.get("current_inventory")
    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No inventory data loaded. Please upload an Excel file first.",
        )

    forecast_results = generate_forecast(df)
    status_list = calculate_inventory_status(df, forecast_results)
    return status_list
