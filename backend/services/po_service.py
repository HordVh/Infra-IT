import os
import math
import pandas as pd
from datetime import datetime, timezone


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


def _ai_justification(model, po: dict) -> str:
    """
    Call Gemini to generate a one-paragraph PO justification narrative
    suitable for a finance committee.
    """
    if model is None:
        return (
            "AI justification unavailable — GEMINI_API_KEY not configured. "
            "Please set the environment variable and restart the server."
        )

    prompt = f"""You are an IT procurement manager writing internal purchase order documentation.

Draft a one-paragraph justification for the following purchase order:

Model: {po['model']}
Suggested Quantity: {po['suggested_quantity']}
Unit Cost: ${po['unit_cost']}
Total Cost: ${po['total_cost']}
Trigger Reason: {po['trigger_reason']}

Write in a professional, concise tone suitable for approval by a finance committee. \
Include the business impact of not procuring, cost justification, and urgency."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI justification error: {str(e)}"


def generate_draft_po(inventory_status: list[dict], candidate_df: pd.DataFrame) -> list[dict]:
    """
    Generates draft purchase orders for CRITICAL and LOW inventory items.
    Matches each flagged model to a candidate product; falls back to the first candidate.
    Calls Gemini for a justification narrative per PO.
    """
    gemini = _get_gemini_model()

    flagged = [item for item in inventory_status if item["status"] in ("CRITICAL", "LOW")]

    # Build candidate lookup keyed by lower-case model name
    candidate_lookup: dict[str, dict] = {}
    if not candidate_df.empty:
        for _, row in candidate_df.iterrows():
            key = str(row.get("model", "")).lower()
            candidate_lookup[key] = row.to_dict()

    first_candidate = candidate_df.iloc[0].to_dict() if not candidate_df.empty else {}

    draft_pos = []
    for idx, item in enumerate(flagged, start=1):
        model_name = item["model"]

        # Fuzzy-match candidate by model name word fragments
        matched_candidate = first_candidate
        for key, candidate in candidate_lookup.items():
            if any(word.lower() in key for word in model_name.lower().split()):
                matched_candidate = candidate
                break

        unit_cost = float(
            matched_candidate.get("cost", matched_candidate.get("unit_cost", 999.0))
        )
        suggested_quantity = max(
            10, math.ceil(item["predicted_demand"] - item["current_stock"]) + 5
        )
        total_cost = round(unit_cost * suggested_quantity, 2)

        po_number = str(idx).zfill(3)
        year = datetime.now(timezone.utc).year
        po_id = f"PO-{year}-{po_number}"

        po = {
            "po_id": po_id,
            "model": model_name,
            "suggested_quantity": suggested_quantity,
            "unit_cost": unit_cost,
            "total_cost": total_cost,
            "trigger_reason": item["reason"],
            "status": "PENDING_APPROVAL",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "ai_justification": None,
        }

        po["ai_justification"] = _ai_justification(gemini, po)
        draft_pos.append(po)

    return draft_pos
