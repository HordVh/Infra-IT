import os
import pandas as pd

SPEC_COLUMNS = ["ram_gb", "storage_gb", "cpu_score"]


def _get_anthropic_client():
    try:
        import anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            return None
        return anthropic.Anthropic(api_key=api_key)
    except ImportError:
        return None


def _ai_assessment(client, candidate: dict, inventory_avg: dict) -> str:
    """Call Claude to get a concise functional fit assessment."""
    if client is None:
        return (
            "AI assessment unavailable — ANTHROPIC_API_KEY not configured. "
            "Please set the environment variable and restart the server."
        )

    prompt = f"""You are an IT procurement analyst. Evaluate the following candidate laptop/device against the current inventory average.

Candidate product:
{candidate}

Current inventory average specs and cost:
{inventory_avg}

Provide a concise 2-3 sentence functional fit assessment. Consider cost justification, spec improvements, and appropriate use cases.
Be direct and actionable, as if writing for a procurement manager."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception as e:
        return f"AI assessment error: {str(e)}"


def evaluate_hardware(candidate_df: pd.DataFrame, inventory_df: pd.DataFrame) -> list[dict]:
    """
    For each candidate product, compares specs against current inventory averages
    and gets an AI-generated functional fit assessment from Claude.
    """
    client = _get_anthropic_client()

    # Compute inventory averages for numeric columns
    numeric_cols = [c for c in ["cost", "unit_cost", "ram_gb", "storage_gb", "cpu_score"] if c in inventory_df.columns]
    inventory_avg: dict = {}
    for col in numeric_cols:
        inventory_avg[col] = round(float(inventory_df[col].mean()), 2)

    # Determine the cost column name in inventory
    inv_cost_key = "unit_cost" if "unit_cost" in inventory_df.columns else "cost"
    avg_inventory_cost = inventory_avg.get(inv_cost_key, inventory_avg.get("cost", None))

    results = []
    for _, row in candidate_df.iterrows():
        candidate_model = str(row.get("model", "Unknown"))
        candidate_cost = float(row["cost"]) if "cost" in candidate_df.columns and pd.notna(row.get("cost")) else None

        # Cost delta
        cost_delta_pct = None
        if candidate_cost is not None and avg_inventory_cost:
            cost_delta_pct = round(((candidate_cost - avg_inventory_cost) / avg_inventory_cost) * 100, 1)

        # Spec summary — only include available spec columns
        spec_summary = {}
        for col in SPEC_COLUMNS:
            if col in candidate_df.columns and pd.notna(row.get(col)):
                spec_summary[col] = row[col]

        # Build candidate context for AI
        candidate_context = {"model": candidate_model, "cost": candidate_cost, **spec_summary}
        if "vendor" in candidate_df.columns:
            candidate_context["vendor"] = str(row.get("vendor", ""))

        ai_text = _ai_assessment(client, candidate_context, inventory_avg)

        results.append(
            {
                "candidate_model": candidate_model,
                "cost": candidate_cost,
                "vs_inventory_avg_cost": avg_inventory_cost,
                "cost_delta_pct": cost_delta_pct,
                "spec_summary": spec_summary,
                "ai_assessment": ai_text,
            }
        )

    return results
