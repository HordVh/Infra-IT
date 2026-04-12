"use client";

import { useState } from "react";
import Link from "next/link";
import HardwareEvalCard from "@/components/HardwareEvalCard";
import { runHardwareEval, HardwareEvalResult } from "@/lib/api";

export default function HardwareEvalPage() {
  const [results, setResults] = useState<HardwareEvalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const handleEval = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runHardwareEval();
      setResults(data);
      setRan(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

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
          Hardware Evaluation
        </span>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Intro */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Candidate Hardware Evaluation
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            AI-powered comparison of candidate products against your current inventory specs and costs.
          </p>
        </div>

        {/* Trigger */}
        <div style={{ marginBottom: 32 }}>
          <button
            id="run-hardware-eval-btn"
            className="btn-primary"
            onClick={handleEval}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Evaluating with AI…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
                Run Hardware Evaluation
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
            {error.includes("data") && (
              <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: "0.75rem" }}>
                Please{" "}
                <Link href="/" style={{ color: "var(--accent-cyan)" }}>
                  upload an Excel file
                </Link>{" "}
                first.
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {ran && !loading && results.length === 0 && !error && (
          <div
            className="glass"
            style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}
          >
            No candidate products found in the uploaded data.
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {results.map((r) => (
              <HardwareEvalCard key={r.candidate_model} result={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
