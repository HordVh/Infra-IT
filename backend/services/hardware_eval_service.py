import os
import pandas as pd

SPEC_COLUMNS = ["ram_gb", "storage_gb", "cpu_score"]


def _get_gemini_model():
    """Initialise and return a Gemini GenerativeModel, or None if unconfigured."""
    try:
        import google.generativeai as genai

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None

        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash")
    except ImportError:
        return None


def _batch_ai_assessment(model, candidates: list[dict], inventory_avg: dict) -> list[str]:
    """
    Call Gemini once to produce assessments for all candidate devices vs. the current inventory average.
    Returns a list of assessments in the same order as the candidates.
    """
    if model is None:
        return [
            "AI assessment unavailable — GEMINI_API_KEY not configured. "
            "Please set the environment variable and restart the server."
        ] * len(candidates)

    prompt = f"""You are an IT procurement analyst. Evaluate the following candidate laptop/devices against the current inventory average.

Current inventory average specs and cost:
{inventory_avg}

Candidate products to evaluate:
"""

    for i, candidate in enumerate(candidates, 1):
        prompt += f"\n{i}. {candidate}"

    prompt += """

For each candidate, provide a concise 2-3 sentence functional fit assessment. Consider cost justification, spec improvements, and appropriate use cases.
Be direct and actionable, as if writing for a procurement manager.

Format your response as:
1. [Assessment for candidate 1]
2. [Assessment for candidate 2]
3. [Assessment for candidate 3]
..."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Parse the numbered response into individual assessments
        assessments = []
        lines = text.split('\n')

        for i in range(1, len(candidates) + 1):
            # Find the line that starts with the candidate number
            candidate_assessment = ""
            for line in lines:
                if line.strip().startswith(f"{i}."):
                    candidate_assessment = line.strip()[3:].strip()  # Remove "X. " prefix
                    break

            if not candidate_assessment:
                candidate_assessment = f"Assessment parsing error for candidate {i}"

            assessments.append(candidate_assessment)

        return assessments

    except Exception as e:
        return [f"AI assessment error: {str(e)}"] * len(candidates)


def evaluate_hardware(candidate_df: pd.DataFrame, inventory_df: pd.DataFrame) -> list[dict]:
    """
    For each candidate product, compares specs against current inventory averages
    and gets an AI-generated functional fit assessment from Gemini.
    """
    gemini = _get_gemini_model()

    # Compute inventory averages for numeric columns
    numeric_cols = [
        c for c in ["cost", "unit_cost", "ram_gb", "storage_gb", "cpu_score"]
        if c in inventory_df.columns
    ]
    inventory_avg: dict = {}
    for col in numeric_cols:
        inventory_avg[col] = round(float(inventory_df[col].mean()), 2)

    # Determine the cost column name in inventory
    inv_cost_key = "unit_cost" if "unit_cost" in inventory_df.columns else "cost"
    avg_inventory_cost = inventory_avg.get(inv_cost_key, inventory_avg.get("cost", None))

    # Collect all candidate data first
    candidates_data = []
    for _, row in candidate_df.iterrows():
        candidate_model = str(row.get("model", "Unknown"))
        candidate_cost = (
            float(row["cost"])
            if "cost" in candidate_df.columns and pd.notna(row.get("cost"))
            else None
        )

        # Spec summary — only include available spec columns
        spec_summary = {}
        for col in SPEC_COLUMNS:
            if col in candidate_df.columns and pd.notna(row.get(col)):
                spec_summary[col] = row[col]

        # Build candidate context dict for the AI prompt
        candidate_context = {"model": candidate_model, "cost": candidate_cost, **spec_summary}
        if "vendor" in candidate_df.columns:
            candidate_context["vendor"] = str(row.get("vendor", ""))

        candidates_data.append({
            "model": candidate_model,
            "cost": candidate_cost,
            "spec_summary": spec_summary,
            "context": candidate_context
        })

    # Make single batch AI assessment call
    candidate_contexts = [c["context"] for c in candidates_data]
    ai_assessments = _batch_ai_assessment(gemini, candidate_contexts, inventory_avg)

    # Build results
    results = []
    for i, candidate_data in enumerate(candidates_data):
        candidate_cost = candidate_data["cost"]

        # Cost delta percentage vs. inventory average
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
