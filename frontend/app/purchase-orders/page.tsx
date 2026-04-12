"use client";

import { useState } from "react";
import Link from "next/link";
import PODraftModal from "@/components/PODraftModal";
import { generatePurchaseOrders, DraftPurchaseOrder } from "@/lib/api";

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<DraftPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generatePurchaseOrders();
      setPos(data);
      setRan(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (po: DraftPurchaseOrder) => {
    setPos((prev) =>
      prev.map((p) => (p.po_id === po.po_id ? { ...p, status: "APPROVED" } : p))
    );
  };

  const handleReject = (po: DraftPurchaseOrder) => {
    setPos((prev) =>
      prev.map((p) => (p.po_id === po.po_id ? { ...p, status: "REJECTED" } : p))
    );
  };

  const totalCost = pos
    .filter((p) => p.status !== "REJECTED")
    .reduce((sum, p) => sum + p.total_cost, 0);

  return (
    <main style={{ minHeight: "100vh", padding: "0 0 80px" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(15,23,42,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>
          ← Back
        </Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
          Purchase Orders
        </span>
        {pos.length > 0 && (
          <>
            <span style={{ color: "var(--border)" }}>|</span>
            <span className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              {pos.length} draft{pos.length !== 1 ? "s" : ""} · Total:{" "}
              <span style={{ color: "var(--accent-cyan)" }}>${totalCost.toLocaleString()}</span>
            </span>
          </>
        )}
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Intro */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Draft Purchase Orders
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Automatically generate AI-justified procurement requests for CRITICAL and LOW inventory items.
          </p>
        </div>

        {/* Trigger */}
        <div style={{ marginBottom: 32 }}>
          <button
            id="generate-pos-btn"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Generating with AI…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                </svg>
                Generate Draft POs
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              color: "#FCA5A5",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.82rem",
              marginBottom: 24,
            }}
          >
            ⚠ {error}
            <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: "0.75rem" }}>
              Please{" "}
              <Link href="/" style={{ color: "var(--accent-cyan)" }}>
                upload an Excel file
              </Link>{" "}
              first.
            </p>
          </div>
        )}

        {/* No POs needed */}
        {ran && !loading && pos.length === 0 && !error && (
          <div
            className="glass"
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>✓ All inventory levels are healthy</p>
            <p style={{ fontSize: "0.85rem" }}>No purchase orders required at this time.</p>
          </div>
        )}

        {/* PO Cards */}
        {pos.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {pos.map((po) => (
              <PODraftModal
                key={po.po_id}
                po={po}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
