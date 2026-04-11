"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InventoryStatusTable from "@/components/InventoryStatusTable";
import ForecastChart from "@/components/ForecastChart";
import { getInventoryStatus, getForecast, InventoryStatusItem, ForecastResult } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryStatusItem[]>([]);
  const [forecast, setForecast] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statusData, forecastData] = await Promise.all([
          getInventoryStatus(),
          getForecast(),
        ]);
        setItems(statusData);
        setForecast(forecastData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const critical = items.filter((i) => i.status === "CRITICAL").length;
  const low = items.filter((i) => i.status === "LOW").length;
  const ok = items.filter((i) => i.status === "OK").length;

  return (
    <main style={{ minHeight: "100vh", padding: "0 0 80px" }}>
      {/* Top bar */}
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
          Inventory Status
        </span>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Summary banner */}
        {!loading && !error && items.length > 0 && (
          <div
            className="glass fade-in"
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 32,
              overflow: "hidden",
            }}
          >
            {[
              { label: "CRITICAL", count: critical, color: "#EF4444" },
              { label: "LOW", count: low, color: "#F59E0B" },
              { label: "OK", count: ok, color: "#22C55E" },
            ].map(({ label, count, color }, i) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  padding: "20px 24px",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none",
                  textAlign: "center",
                }}
              >
                <p
                  className="font-mono-data"
                  style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1 }}
                >
                  {count}
                </p>
                <p className="font-mono-data" style={{ color: "var(--text-muted)", fontSize: "0.68rem", letterSpacing: "0.15em", marginTop: 6, textTransform: "uppercase" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              color: "#FCA5A5",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.85rem",
              marginBottom: 24,
            }}
          >
            ⚠ {error}
            <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Please{" "}
              <Link href="/" style={{ color: "var(--accent-cyan)" }}>
                upload an Excel file
              </Link>{" "}
              first.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        )}

        {/* Forecast chart */}
        {!loading && !error && forecast.length > 0 && (
          <div className="glass fade-in" style={{ padding: "24px", marginBottom: 24 }}>
            <h2
              className="font-mono-data"
              style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}
            >
              Stock vs. Predicted Demand
            </h2>
            <ForecastChart data={forecast} />
          </div>
        )}

        {/* Table */}
        {!loading && !error && items.length > 0 && (
          <div className="glass fade-in" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
              <h2
                className="font-mono-data"
                style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                All Models
              </h2>
            </div>
            <div style={{ padding: "0 0 8px" }}>
              <InventoryStatusTable items={items} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
