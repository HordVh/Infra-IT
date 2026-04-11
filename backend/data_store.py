"""
Shared in-memory data store.
DataFrames are keyed by sheet name and set during /upload.
This module is imported by all routers and services.
"""
import pandas as pd
from typing import Optional

data_store: dict[str, Optional[pd.DataFrame]] = {
    "hardware_requests": None,
    "current_inventory": None,
    "candidate_products": None,
}
