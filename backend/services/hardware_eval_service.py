import logging
import pandas as pd
from services.ai_client import generate_response

SPEC_COLUMNS = ["ram_gb", "storage_gb", "cpu_score"]

logger = logging.getLogger(__name__)

_UNAVAILABLE_MSG = (
    "AI assessment unavailable — Llama API could not be reached. "
    "Ensure ollamafreeapi is installed and the service is running."
)


def _batch_ai_assessment(candidates: list[dict], inventory_avg: dict) -> list[str]:
    """
    Call Llama 3 once to produce assessments for all candidate devices vs. the current inventory average.
    Returns a list of assessments in the same order as the candidates.
    """
    if not candidates:
        return []

    prompt = f"""You are an IT procurement analyst. Evaluate the following candidate laptop/devices against the current inventory average.

Current inventory average specs and cost:
{inventory_avg}

Candidate products to evaluate:
"""

    for i, candidate in enumerate(candidates, 1):
        prompt += f"\n{i}. {candidate}"

    prompt += f"""

For each numbered candidate above, write a concise 5-6 sentence procurement recommendation. Cover cost justification versus the inventory average, spec improvements, and suitable use cases. Be direct and actionable.

Respond using exactly this format — replace the example text with your real analysis:
1. Good value at $X; RAM and storage exceed the fleet average, making it suitable for developers.
2. Higher cost than average but the CPU score improvement justifies it for power users.
(continue for all {len(candidates)} candidates)"""

    try:
        result = generate_response(prompt)
        if result is None:
            return [_UNAVAILABLE_MSG] * len(candidates)

        text = str(result).strip()
        lines = text.split('\n')

        # Build a map: candidate number -> all lines belonging to that entry
        import re
        entry_map: dict[int, list[str]] = {}
        current_idx: int | None = None
        for line in lines:
            m = re.match(r'^(\d+)\.\s+(.*)', line.strip())
            if m:
                current_idx = int(m.group(1))
                if 1 <= current_idx <= len(candidates):
                    entry_map.setdefault(current_idx, []).append(m.group(2).strip())
            elif current_idx is not None and line.strip():
                entry_map.setdefault(current_idx, []).append(line.strip())

        assessments = []
        for i in range(1, len(candidates) + 1):
            parts = entry_map.get(i, [])
            candidate_assessment = " ".join(parts).strip() if parts else f"Assessment parsing error for candidate {i}"
            assessments.append(candidate_assessment)

        return assessments

    except Exception as e:
        logger.error("Hardware eval AI assessment failed: %s", e)
        return [f"AI assessment error: {str(e)}"] * len(candidates)


def evaluate_hardware(candidate_df: pd.DataFrame, inventory_df: pd.DataFrame) -> list[dict]:
    """
    For each candidate product, compares specs against current inventory averages
    and gets an AI-generated functional fit assessment from Llama 3.
    """
    numeric_cols = [
        c for c in ["cost", "unit_cost", "ram_gb", "storage_gb", "cpu_score"]
        if c in inventory_df.columns
    ]
    inventory_avg: dict = {}
    for col in numeric_cols:
        inventory_avg[col] = round(float(inventory_df[col].mean()), 2)

    inv_cost_key = "unit_cost" if "unit_cost" in inventory_df.columns else "cost"
    avg_inventory_cost = inventory_avg.get(inv_cost_key, inventory_avg.get("cost", None))

    candidates_data = []
    for _, row in candidate_df.iterrows():
        candidate_model = str(row.get("model", "Unknown"))
        candidate_cost = (
            float(row["cost"])
            if "cost" in candidate_df.columns and pd.notna(row.get("cost"))
            else None
        )

        spec_summary = {}
        for col in SPEC_COLUMNS:
            if col in candidate_df.columns and pd.notna(row.get(col)):
                spec_summary[col] = row[col]

        candidate_context = {"model": candidate_model, "cost": candidate_cost, **spec_summary}
        if "vendor" in candidate_df.columns:
            candidate_context["vendor"] = str(row.get("vendor", ""))

        candidates_data.append({
            "model": candidate_model,
            "cost": candidate_cost,
            "spec_summary": spec_summary,
            "context": candidate_context
        })

    candidate_contexts = [c["context"] for c in candidates_data]
    ai_assessments = _batch_ai_assessment(candidate_contexts, inventory_avg)

    results = []
    for i, candidate_data in enumerate(candidates_data):
        candidate_cost = candidate_data["cost"]

        cost_delta_pct = None
        if candidate_cost is not None and avg_inventory_cost:
            cost_delta_pct = round(
                ((candidate_cost - avg_inventory_cost) / avg_inventory_cost) * 100, 1
            )

        results.append(
            {
                "candidate_model": candidate_data["model"],
                "cost": candidate_cost,
                "vs_inventory_avg_cost": avg_inventory_cost,
                "cost_delta_pct": cost_delta_pct,
                "spec_summary": candidate_data["spec_summary"],
                "ai_assessment": ai_assessments[i],
            }
        )

    return results
