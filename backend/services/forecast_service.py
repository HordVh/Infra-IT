import random
import pandas as pd


def generate_forecast(inventory_df: pd.DataFrame) -> list[dict]:
    """
    Produces a linear-trend forecast per model.

    Expected columns: model, quantity, (optionally) monthly_usage.
    If quantity is absent, the current stock is inferred as the row count per model.
    If monthly_usage is absent, it is mocked as a random int 5-20.
    Predicted demand = monthly_usage * 1.15 (15% growth assumption).
    """
    if "quantity" in inventory_df.columns:
        grouped = (
            inventory_df.groupby("model", as_index=False)
            .agg({"quantity": "sum"})
        )
    else:
        grouped = (
            inventory_df.groupby("model", as_index=False)
            .size()
            .reset_index()
            .rename(columns={"size": "quantity"})
            .drop(columns=["index"])
        )

    if "monthly_usage" in inventory_df.columns:
        monthly_usage = (
            inventory_df.groupby("model", as_index=False)["monthly_usage"]
            .sum()
        )
        grouped = grouped.merge(monthly_usage, on="model", how="left")

    results = []
    for _, row in grouped.iterrows():
        model = str(row.get("model", "Unknown"))
        current_stock = float(row.get("quantity", 0))

        if "monthly_usage" in row and pd.notna(row.get("monthly_usage")):
            monthly_usage_value = float(row["monthly_usage"])
        else:
            random.seed(hash(model) % (2**32))
            monthly_usage_value = random.randint(5, 20)

        predicted_demand = round(monthly_usage_value * 1.15, 2)

        results.append(
            {
                "model": model,
                "current_stock": current_stock,
                "monthly_usage": monthly_usage_value,
                "predicted_demand": predicted_demand,
            }
        )

    return results
