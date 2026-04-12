from fastapi import APIRouter, HTTPException

from data_store import data_store
from services.forecast_service import generate_forecast

router = APIRouter()


@router.get("/forecast")
def get_forecast():
    """
    Returns raw linear-trend forecast data for chart rendering.
    Requires data to have been uploaded first via POST /upload.
    """
    df = data_store.get("current_inventory")
    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No inventory data loaded. Please upload an Excel file first.",
        )

    return generate_forecast(df)
