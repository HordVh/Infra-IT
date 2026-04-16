"""
Process an Excel file directly, bypassing the HTTP API.

Usage:
    python process_file.py <path_to_excel.xlsx>
    python process_file.py               # defaults to sample_data.xlsx

The script validates the file, runs forecast + inventory-status logic,
saves the file as uploaded_data.xlsx (so the FastAPI server picks it up
on next restart), and prints a summary to stdout.
"""
import sys
from pathlib import Path

import pandas as pd

REQUIRED_SHEETS = ["hardware_requests", "current_inventory", "candidate_products"]
BACKEND_DIR = Path(__file__).parent
PERSISTED_FILE = BACKEND_DIR / "uploaded_data.xlsx"


def normalize(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df


def load_excel(path: Path) -> dict[str, pd.DataFrame]:
    print(f"Loading: {path}")
    try:
        xls = pd.ExcelFile(path, engine="openpyxl")
    except Exception as exc:
        sys.exit(f"ERROR: Cannot open file — {exc}")

    missing = [s for s in REQUIRED_SHEETS if s not in xls.sheet_names]
    if missing:
        sys.exit(f"ERROR: Missing required sheet(s): {', '.join(missing)}\n"
                 f"  Found sheets: {xls.sheet_names}")

    return {sheet: normalize(pd.read_excel(xls, sheet_name=sheet))
            for sheet in REQUIRED_SHEETS}


def run_forecast(inventory_df: pd.DataFrame) -> list[dict]:
    import random

    if "quantity" in inventory_df.columns:
        grouped = inventory_df.groupby("model", as_index=False).agg({"quantity": "sum"})
    else:
        grouped = (inventory_df.groupby("model", as_index=False)
                   .size().reset_index()
                   .rename(columns={"size": "quantity"})
                   .drop(columns=["index"]))

    if "monthly_usage" in inventory_df.columns:
        usage = inventory_df.groupby("model", as_index=False)["monthly_usage"].sum()
        grouped = grouped.merge(usage, on="model", how="left")

    results = []
    for _, row in grouped.iterrows():
        model = str(row.get("model", "Unknown"))
        stock = float(row.get("quantity", 0))
        if "monthly_usage" in row and pd.notna(row.get("monthly_usage")):
            usage_val = float(row["monthly_usage"])
        else:
            random.seed(hash(model) % (2 ** 32))
            usage_val = random.randint(5, 20)
        predicted = round(usage_val * 1.15, 2)
        results.append({"model": model, "current_stock": stock,
                         "monthly_usage": usage_val, "predicted_demand": predicted})
    return results


def run_inventory_status(inventory_df: pd.DataFrame, forecast: list[dict]) -> list[dict]:
    import math

    if "quantity" in inventory_df.columns:
        inv_summary = inventory_df.groupby("model", as_index=False)["quantity"].sum()
    else:
        inv_summary = (inventory_df.groupby("model", as_index=False)
                       .size().reset_index()
                       .rename(columns={"size": "quantity"})
                       .drop(columns=["index"]))

    forecast_df = pd.DataFrame(forecast)
    merged = forecast_df.merge(inv_summary, on="model", how="left")

    statuses = []
    for _, row in merged.iterrows():
        stock = float(row.get("quantity", 0))
        demand = float(row.get("predicted_demand", 0))
        if demand >= stock * 0.9:
            status, reason = "CRITICAL", "Predicted demand meets or exceeds available stock"
        elif demand >= stock * 0.6:
            status, reason = "LOW", "Demand is approaching stock levels"
        else:
            status, reason = "OK", "Stock levels are sufficient for projected demand"
        statuses.append({"model": str(row["model"]), "status": status,
                          "reason": reason, "current_stock": stock,
                          "predicted_demand": demand})
    return statuses


def print_section(title: str, rows: list[dict], cols: list[str]) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    header = "  ".join(f"{c:<20}" for c in cols)
    print(header)
    print("-" * len(header))
    for row in rows:
        line = "  ".join(f"{str(row.get(c, '')):<20}" for c in cols)
        print(line)


def main() -> None:
    if len(sys.argv) > 1:
        excel_path = Path(sys.argv[1])
    else:
        excel_path = BACKEND_DIR / "sample_data.xlsx"

    if not excel_path.exists():
        sys.exit(f"ERROR: File not found — {excel_path}")

    sheets = load_excel(excel_path)

    # Save as uploaded_data.xlsx so the API server uses it on next start
    raw_bytes = excel_path.read_bytes()
    PERSISTED_FILE.write_bytes(raw_bytes)
    print(f"Saved as: {PERSISTED_FILE}")

    inventory_df = sheets["current_inventory"]
    requests_df = sheets["hardware_requests"]
    candidates_df = sheets["candidate_products"]

    forecast = run_forecast(inventory_df)
    statuses = run_inventory_status(inventory_df, forecast)

    print_section("HARDWARE REQUESTS",
                  requests_df.to_dict(orient="records"),
                  [c for c in ["request_id", "department", "model_requested", "quantity", "urgency"]
                   if c in requests_df.columns])

    print_section("CURRENT INVENTORY",
                  inventory_df.to_dict(orient="records"),
                  [c for c in ["model", "quantity", "monthly_usage", "unit_cost"]
                   if c in inventory_df.columns])

    print_section("FORECAST",
                  forecast,
                  ["model", "current_stock", "monthly_usage", "predicted_demand"])

    print_section("INVENTORY STATUS",
                  statuses,
                  ["model", "status", "current_stock", "predicted_demand"])

    print_section("CANDIDATE PRODUCTS",
                  candidates_df.to_dict(orient="records"),
                  [c for c in ["model", "cost", "ram_gb", "storage_gb", "cpu_score", "vendor"]
                   if c in candidates_df.columns])

    critical = sum(1 for s in statuses if s["status"] == "CRITICAL")
    low = sum(1 for s in statuses if s["status"] == "LOW")
    ok = sum(1 for s in statuses if s["status"] == "OK")
    print(f"\nSummary: {critical} CRITICAL  |  {low} LOW  |  {ok} OK")
    print("\nDone. Restart the API server to use this data.\n")


if __name__ == "__main__":
    main()
