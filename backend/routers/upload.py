import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException

from data_store import data_store, save_uploaded_file

router = APIRouter()

REQUIRED_SHEETS = ["hardware_requests", "current_inventory", "candidate_products"]


@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    """
    Accept a .xlsx file, parse the 3 required sheets,
    cache DataFrames in memory, return 5-row previews.
    """
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are accepted.")

    contents = await file.read()

    try:
        xls = pd.ExcelFile(io.BytesIO(contents), engine="openpyxl")
    except Exception:
        raise HTTPException(status_code=400, detail="File is not a valid Excel (.xlsx) file.")

    # Validate all sheets present
    for sheet_name in REQUIRED_SHEETS:
        if sheet_name not in xls.sheet_names:
            raise HTTPException(
                status_code=422,
                detail=f"Missing sheet: {sheet_name}",
            )

    # Parse, normalize, and cache
    previews = {}
    for sheet_name in REQUIRED_SHEETS:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        df = df.copy()
        df.columns = [str(col).strip().lower().replace(" ", "_") for col in df.columns]
        data_store[sheet_name] = df
        # Replace NaN with None for JSON serialization
        previews[sheet_name] = df.head(5).where(pd.notnull(df.head(5)), None).to_dict(orient="records")

    save_uploaded_file(contents)
    return previews
