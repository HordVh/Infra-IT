"use client";

import { HardwareEvalResult } from "@/lib/api";

interface Props {
  result: HardwareEvalResult;
}

export default function HardwareEvalCard({ result }: Props) {
  const costDelta = result.cost_delta_pct;
  const deltaColor =
    costDelta === null
      ? "var(--text-muted)"
      : costDelta > 15
      ? "#FCA5A5"
      : costDelta < -5
      ? "#86EFAC"
      : "#FCD34D";

  return (
    <div
      className="glass fade-in"
      style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3
            style={{
              color: "var(--text-primary)",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {result.candidate_model}
          </h3>
          {result.cost !== null && (
            <p
              className="font-mono-data"
              style={{ color: "var(--accent-cyan)", fontSize: "1.25rem", fontWeight: 500 }}
            >
              ${result.cost?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Cost delta badge */}
        {costDelta !== null && (
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${deltaColor}40`,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <p className="font-mono-data" style={{ color: deltaColor, fontSize: "1.1rem", fontWeight: 500 }}>
              {costDelta > 0 ? "+" : ""}
              {costDelta}%
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", marginTop: 2 }}>
              vs. avg inventory
            </p>
          </div>
        )}
      </div>

      {/* Spec summary */}
      {Object.keys(result.spec_summary).length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {Object.entries(result.spec_summary).map(([key, val]) => (
            <div
              key={key}
              style={{
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 12px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                className="font-mono-data"
                style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase" }}
              >
                {key.replace("_", " ")}
              </span>
              <span
                className="font-mono-data"
                style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 500 }}
              >
                {String(val)}
              </span>
            </div>
          ))}
          {result.vs_inventory_avg_cost !== null && (
            <div
              style={{
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 12px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                className="font-mono-data"
                style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase" }}
              >
                avg inv cost
              </span>
              <span
                className="font-mono-data"
                style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 500 }}
              >
                ${result.vs_inventory_avg_cost?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* AI Assessment */}
      <div
        style={{
          background: "rgba(6,182,212,0.04)",
          border: "1px solid rgba(6,182,212,0.15)",
          borderLeft: "3px solid var(--accent-cyan)",
          borderRadius: "0 8px 8px 0",
          padding: "14px 16px",
        }}
      >
        <p
          className="font-mono-data"
          style={{ color: "var(--accent-cyan)", fontSize: "0.68rem", letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}
        >
          ✦ AI Assessment
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>
          {result.ai_assessment}
        </p>
      </div>
    </div>
  );
}
