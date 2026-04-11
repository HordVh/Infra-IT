from fastapi import APIRouter, HTTPException

from data_store import data_store
from services.hardware_eval_service import evaluate_hardware

router = APIRouter()


@router.post("/hardware-eval")
def run_hardware_evaluation():
    """
    Evaluates candidate products against current inventory using AI.
    Requires data to have been uploaded first via POST /upload.
    """
    candidate_df = data_store.get("candidate_products")
    inventory_df = data_store.get("current_inventory")

    if candidate_df is None or inventory_df is None:
        raise HTTPException(
            status_code=400,
            detail="No data loaded. Please upload an Excel file first.",
        )

    results = evaluate_hardware(candidate_df, inventory_df)
    return results
