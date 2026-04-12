import pandas as pd


def calculate_inventory_status(
    inventory_df: pd.DataFrame,
    forecast_results: list[dict],
) -> list[dict]:
    """
    Merges inventory with forecast results and applies threshold logic:
      predicted_demand >= current_stock * 0.9  → CRITICAL
      predicted_demand >= current_stock * 0.6  → LOW
      else                                      → OK
    """
    if "quantity" in inventory_df.columns:
        inventory_summary = (
            inventory_df.groupby("model", as_index=False)["quantity"].sum()
        )
    else:
        inventory_summary = (
            inventory_df.groupby("model", as_index=False)
            .size()
            .reset_index()
            .rename(columns={"size": "quantity"})
            .drop(columns=["index"])
        )

    forecast_df = pd.DataFrame(forecast_results)
    merged = forecast_df.merge(
        inventory_summary,
        on="model",
        how="left",
    )

    status_list = []
    for _, row in merged.iterrows():
        model = str(row["model"])
        current_stock = float(row.get("quantity", 0))
        predicted_demand = float(row.get("predicted_demand", 0))

        critical_threshold = current_stock * 0.9
        low_threshold = current_stock * 0.6

        if predicted_demand >= critical_threshold:
            status = "CRITICAL"
            reason = "Predicted demand meets or exceeds available stock"
        elif predicted_demand >= low_threshold:
            status = "LOW"
            reason = "Demand is approaching stock levels"
        else:
            status = "OK"
            reason = "Stock levels are sufficient for projected demand"

        status_list.append(
            {
                "model": model,
                "status": status,
                "reason": reason,
                "current_stock": current_stock,
                "predicted_demand": predicted_demand,
            }
        )

    return status_list
