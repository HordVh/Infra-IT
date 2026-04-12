"use client";

import { useState } from "react";
import { DraftPurchaseOrder } from "@/lib/api";

interface Props {
  po: DraftPurchaseOrder;
  onApprove: (po: DraftPurchaseOrder) => void;
  onReject: (po: DraftPurchaseOrder) => void;
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "APPROVED"
      ? "#22C55E"
      : status === "REJECTED"
      ? "#EF4444"
      : "#F59E0B";
  return (
    <span
      className="font-mono-data"
      style={{
        padding: "3px 10px",
        borderRadius: 9999,
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        border: `1px solid ${color}40`,
        background: `${color}18`,
        color,
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function PODraftModal({ po, onApprove, onReject }: Props) {
  const [showJustification, setShowJustification] = useState(false);

  return (
    <div
      className="glass fade-in"
      style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="font-mono-data" style={{ color: "var(--accent-cyan)", fontSize: "0.75rem", marginBottom: 2 }}>
            {po.po_id}
          </p>
          <h3 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 600 }}>
            {po.model}
          </h3>
        </div>
        <StatusPill status={po.status} />
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Qty", value: po.suggested_quantity },
          { label: "Unit Cost", value: `$${po.unit_cost.toLocaleString()}` },
          { label: "Total", value: `$${po.total_cost.toLocaleString()}` },
          { label: "Generated", value: new Date(po.generated_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "var(--bg-surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <p
              className="font-mono-data"
              style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: 4 }}
            >
              {label}
            </p>
            <p
              className="font-mono-data"
              style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 500 }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Trigger reason */}
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 8,
        }}
      >
        <span
          className="font-mono-data"
          style={{ color: "#FCD34D", fontSize: "0.72rem", display: "block", marginBottom: 4, textTransform: "uppercase" }}
        >
          Trigger Reason
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          {po.trigger_reason}
        </span>
      </div>

      {/* AI Justification expandable */}
      {po.ai_justification && (
        <div>
          <button
            onClick={() => setShowJustification((s) => !s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--accent-cyan)",
              fontSize: "0.8rem",
              fontFamily: "'DM Mono', monospace",
              padding: 0,
            }}
          >
            <span style={{ display: "inline-block", transform: showJustification ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
              ▶
            </span>
            AI Justification
          </button>
          {showJustification && (
            <div
              className="fade-in"
              style={{
                marginTop: 10,
                padding: "14px 16px",
                background: "rgba(6,182,212,0.04)",
                border: "1px solid rgba(6,182,212,0.15)",
                borderLeft: "3px solid var(--accent-cyan)",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.75 }}>
                {po.ai_justification}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {po.status === "PENDING_APPROVAL" && (
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            id={`approve-${po.po_id}`}
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center", background: "#22C55E", color: "#052e16" }}
            onClick={() => onApprove(po)}
          >
            ✓ Approve
          </button>
          <button
            id={`reject-${po.po_id}`}
            className="btn-ghost"
            style={{ flex: 1, justifyContent: "center", borderColor: "rgba(239,68,68,0.4)", color: "#FCA5A5" }}
            onClick={() => onReject(po)}
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
}
