"""
Shared data store for uploaded Excel data.
DataFrames are keyed by sheet name and persisted to disk as a saved upload file.
"""
from pathlib import Path
from typing import Optional

import pandas as pd

REQUIRED_SHEETS = ["hardware_requests", "current_inventory", "candidate_products"]
PERSISTED_FILE = Path(__file__).parent / "uploaded_data.xlsx"

data_store: dict[str, Optional[pd.DataFrame]] = {
    "hardware_requests": None,
    "current_inventory": None,
    "candidate_products": None,
}


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names so the backend can use expected lower-case keys."""
    df = df.copy()
    df.columns = [
        str(col).strip().lower().replace(" ", "_")
        for col in df.columns
    ]
    return df


def load_saved_data() -> bool:
    """Load persisted Excel data into the in-memory store if a saved file exists."""
    if not PERSISTED_FILE.exists():
        return False

    xls = pd.ExcelFile(PERSISTED_FILE, engine="openpyxl")

    for sheet_name in REQUIRED_SHEETS:
        if sheet_name not in xls.sheet_names:
            return False

    for sheet_name in REQUIRED_SHEETS:
        data_store[sheet_name] = normalize_dataframe(
            pd.read_excel(xls, sheet_name=sheet_name)
        )

    return True


def save_uploaded_file(contents: bytes) -> None:
    """Persist the uploaded Excel bytes to disk for later reload."""
    PERSISTED_FILE.write_bytes(contents)
