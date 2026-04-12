const BASE_URL = "http://127.0.0.1:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface InventoryStatusItem {
  model: string;
  status: "CRITICAL" | "LOW" | "OK";
  reason: string;
  current_stock: number;
  predicted_demand: number;
}

export interface ForecastResult {
  model: string;
  current_stock: number;
  monthly_usage: number;
  predicted_demand: number;
}

export interface HardwareEvalResult {
  candidate_model: string;
  cost: number | null;
  vs_inventory_avg_cost: number | null;
  cost_delta_pct: number | null;
  spec_summary: Record<string, number | string>;
  ai_assessment: string;
}

export interface DraftPurchaseOrder {
  po_id: string;
  model: string;
  suggested_quantity: number;
  unit_cost: number;
  total_cost: number;
  trigger_reason: string;
  status: string;
  generated_at: string;
  ai_justification: string | null;
}

export interface UploadPreview {
  hardware_requests: Record<string, unknown>[];
  current_inventory: Record<string, unknown>[];
  candidate_products: Record<string, unknown>[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── API Wrappers ───────────────────────────────────────────────────────────

export async function uploadExcel(file: File): Promise<UploadPreview> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<UploadPreview>("/upload", { method: "POST", body: form });
}

export async function getInventoryStatus(): Promise<InventoryStatusItem[]> {
  return apiFetch<InventoryStatusItem[]>("/inventory-status");
}

export async function getForecast(): Promise<ForecastResult[]> {
  return apiFetch<ForecastResult[]>("/forecast");
}

export async function runHardwareEval(): Promise<HardwareEvalResult[]> {
  return apiFetch<HardwareEvalResult[]>("/hardware-eval", { method: "POST" });
}

export async function generatePurchaseOrders(): Promise<DraftPurchaseOrder[]> {
  return apiFetch<DraftPurchaseOrder[]>("/purchase-orders/generate", {
    method: "POST",
  });
}
