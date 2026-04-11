import random
import pandas as pd


def generate_forecast(inventory_df: pd.DataFrame) -> list[dict]:
    """
    Produces a linear-trend forecast per model.

    Expected columns: model, quantity, (optionally) monthly_usage.
    If monthly_usage is absent, it is mocked as a random int 5-20.
    Predicted demand = monthly_usage * 1.15 (15% growth assumption).
    """
    results = []

    for _, row in inventory_df.iterrows():
        model = str(row.get("model", "Unknown"))
        current_stock = float(row.get("quantity", 0))

        if "monthly_usage" in inventory_df.columns and pd.notna(row.get("monthly_usage")):
            monthly_usage = float(row["monthly_usage"])
        else:
            # Seed with model name for reproducibility within a session
            random.seed(hash(model) % (2**32))
            monthly_usage = random.randint(5, 20)

        predicted_demand = round(monthly_usage * 1.15, 2)

        results.append(
            {
                "model": model,
                "current_stock": current_stock,
                "monthly_usage": monthly_usage,
                "predicted_demand": predicted_demand,
            }
        )

    return results
