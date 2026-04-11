"use client";

import { useState } from "react";
import Link from "next/link";
import UploadPanel from "@/components/UploadPanel";
import { UploadPreview } from "@/lib/api";

function NavCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="glass"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-cyan)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.transform = "none";
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
            {title}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
        <span style={{ color: "var(--accent-cyan)", marginLeft: "auto", fontSize: "1.2rem" }}>→</span>
      </div>
    </Link>
  );
}

function SheetPreviewCard({
  title,
  rows,
}: {
  title: string;
  rows: Record<string, unknown>[];
}) {
  if (!rows.length) return null;
  const keys = Object.keys(rows[0]);
  return (
    <div className="glass" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p className="font-mono-data" style={{ color: "var(--accent-cyan)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title.replace("_", " ")}
        </p>
        <span className="badge badge-ok">{rows.length} rows (preview)</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k}>{String(row[k] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const [preview, setPreview] = useState<UploadPreview | null>(null);

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
          justifyContent: "space-between",
          background: "rgba(15,23,42,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent-cyan)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            IT Procurement Intelligence
          </span>
        </div>
        <span
          className="font-mono-data badge badge-ok"
          style={{ fontSize: "0.68rem" }}
        >
          v1.0 · PROTOTYPE
        </span>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "50px 24px 0" }}>
        {/* Hero */}
        <div className="fade-in" style={{ marginBottom: 48, textAlign: "center" }}>
          <div
            className="font-mono-data"
            style={{
              display: "inline-block",
              color: "var(--accent-cyan)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 16,
              padding: "4px 14px",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 9999,
            }}
          >
            ✦ AI-Powered
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            IT Procurement &amp;
            <br />
            <span style={{ color: "var(--accent-cyan)" }}>Inventory Intelligence</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: 520, margin: "0 auto" }}>
            Upload your inventory data, predict shortfalls, evaluate hardware candidates, and
            generate AI-drafted purchase orders — all in one place.
          </p>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 32 }}>
          <UploadPanel onUploadSuccess={(data) => setPreview(data)} />
        </div>

        {/* Sheet previews */}
        {preview && (
          <div className="fade-in" style={{ marginBottom: 48, display: "flex", flexDirection: "column", gap: 16 }}>
            <h2
              className="font-mono-data"
              style={{
                color: "var(--text-muted)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Upload Preview
            </h2>
            <SheetPreviewCard title="hardware_requests" rows={preview.hardware_requests} />
            <SheetPreviewCard title="current_inventory" rows={preview.current_inventory} />
            <SheetPreviewCard title="candidate_products" rows={preview.candidate_products} />
          </div>
        )}

        {/* Nav cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2
            className="font-mono-data"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Modules
          </h2>

          <NavCard
            href="/inventory"
            title="Inventory Status"
            description="View stock levels, forecast shortfalls, and CRITICAL / LOW / OK status for each model."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.8">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
          <NavCard
            href="/hardware-eval"
            title="Hardware Evaluation"
            description="AI-powered analysis of candidate products versus current inventory specs and cost."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            }
          />
          <NavCard
            href="/purchase-orders"
            title="Purchase Orders"
            description="Auto-generate AI-justified draft POs for flagged inventory items, ready for approval."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            }
          />
        </div>
      </div>
    </main>
  );
}
