"""
Run this script once to generate backend/sample_data.xlsx.
Usage: python create_sample_data.py
"""
import pandas as pd
from pathlib import Path


HARDWARE_REQUESTS = [
    {"request_id": "REQ-001", "department": "Engineering",  "model_requested": "Dell Latitude 14", "quantity": 5,  "urgency": "High"},
    {"request_id": "REQ-002", "department": "Finance",      "model_requested": "Lenovo ThinkPad X1", "quantity": 3, "urgency": "Medium"},
    {"request_id": "REQ-003", "department": "HR",           "model_requested": "HP ProBook 450",    "quantity": 8,  "urgency": "Low"},
    {"request_id": "REQ-004", "department": "IT",           "model_requested": "Apple MacBook Pro", "quantity": 2,  "urgency": "High"},
    {"request_id": "REQ-005", "department": "Sales",        "model_requested": "Dell Latitude 14",  "quantity": 10, "urgency": "High"},
    {"request_id": "REQ-006", "department": "Marketing",    "model_requested": "Lenovo ThinkPad X1","quantity": 4,  "urgency": "Medium"},
    {"request_id": "REQ-007", "department": "Engineering",  "model_requested": "Apple MacBook Pro", "quantity": 3,  "urgency": "High"},
]

CURRENT_INVENTORY = [
    {"model": "Dell Latitude 14",    "quantity": 8,  "monthly_usage": 12, "unit_cost": 899},
    {"model": "Lenovo ThinkPad X1",  "quantity": 5,  "monthly_usage": 6,  "unit_cost": 1150},
    {"model": "HP ProBook 450",      "quantity": 20, "monthly_usage": 4,  "unit_cost": 749},
    {"model": "Apple MacBook Pro",   "quantity": 4,  "monthly_usage": 5,  "unit_cost": 1999},
    {"model": "Microsoft Surface Pro","quantity": 3, "monthly_usage": 3,  "unit_cost": 1299},
]

CANDIDATE_PRODUCTS = [
    {"model": "HP EliteBook 840 G10",   "cost": 1200, "ram_gb": 16, "storage_gb": 512,  "cpu_score": 88, "vendor": "HP"},
    {"model": "Dell XPS 15",            "cost": 1599, "ram_gb": 32, "storage_gb": 1024, "cpu_score": 95, "vendor": "Dell"},
    {"model": "Lenovo ThinkPad T14s",   "cost": 980,  "ram_gb": 16, "storage_gb": 512,  "cpu_score": 82, "vendor": "Lenovo"},
    {"model": "Apple MacBook Air M3",   "cost": 1299, "ram_gb": 16, "storage_gb": 512,  "cpu_score": 98, "vendor": "Apple"},
    {"model": "Microsoft Surface Laptop 5", "cost": 1099, "ram_gb": 16, "storage_gb": 256, "cpu_score": 78, "vendor": "Microsoft"},
]


def create_sample_xlsx():
    output_path = Path(__file__).parent / "sample_data.xlsx"
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        pd.DataFrame(HARDWARE_REQUESTS).to_excel(writer, sheet_name="hardware_requests", index=False)
        pd.DataFrame(CURRENT_INVENTORY).to_excel(writer, sheet_name="current_inventory", index=False)
        pd.DataFrame(CANDIDATE_PRODUCTS).to_excel(writer, sheet_name="candidate_products", index=False)
    print(f"✅ Sample data written to {output_path}")


if __name__ == "__main__":
    create_sample_xlsx()
