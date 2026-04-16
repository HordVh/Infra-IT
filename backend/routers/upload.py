import io
import logging
import math
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException

from data_store import data_store, save_uploaded_file

router = APIRouter()
logger = logging.getLogger(__name__)

REQUIRED_SHEETS = ["hardware_requests", "current_inventory", "candidate_products"]


def _to_json_safe(value):
    """Convert a single value to a JSON-serializable Python type."""
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    # numpy scalar types
    try:
        import numpy as np
        if isinstance(value, (np.integer,)):
            return int(value)
        if isinstance(value, (np.floating,)):
            return None if math.isnan(float(value)) else float(value)
        if isinstance(value, (np.bool_,)):
            return bool(value)
    except ImportError:
        pass
    # pandas Timestamp / NaT
    try:
        import pandas as pd
        if isinstance(value, pd.Timestamp):
            return value.isoformat()
        if value is pd.NaT:
            return None
    except Exception:
        pass
    return value


def _safe_preview(df: pd.DataFrame, n: int = 5) -> list[dict]:
    """Return first n rows as JSON-safe dicts."""
    rows = []
    for _, row in df.head(n).iterrows():
        rows.append({k: _to_json_safe(v) for k, v in row.items()})
    return rows


@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are accepted.")

    try:
        contents = await file.read()
    except Exception as exc:
        logger.exception("Failed to read uploaded file")
        raise HTTPException(status_code=400, detail=f"Could not read file: {exc}")

    try:
        xls = pd.ExcelFile(io.BytesIO(contents), engine="openpyxl")
    except Exception as exc:
        logger.exception("Failed to parse Excel file")
        raise HTTPException(status_code=400, detail="File is not a valid Excel (.xlsx) file.")

    missing = [s for s in REQUIRED_SHEETS if s not in xls.sheet_names]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing sheet(s): {', '.join(missing)}. "
                   f"Found: {xls.sheet_names}",
        )

    previews = {}
    try:
        for sheet_name in REQUIRED_SHEETS:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            df = df.copy()
            df.columns = [str(col).strip().lower().replace(" ", "_") for col in df.columns]
            data_store[sheet_name] = df
            previews[sheet_name] = _safe_preview(df)
    except Exception as exc:
        logger.exception("Failed to parse sheet data")
        raise HTTPException(
            status_code=422,
            detail=f"Error reading sheet data: {exc}",
        )

    try:
        save_uploaded_file(contents)
    except Exception as exc:
        logger.warning("Could not save uploaded file to disk: %s", exc)

    return previews
