"use client";

import { useRef, useState, useCallback } from "react";
import { uploadExcel, UploadPreview } from "@/lib/api";

interface Props {
  onUploadSuccess: (data: UploadPreview) => void;
}

export default function UploadPanel({ onUploadSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!f.name.endsWith(".xlsx")) {
      setError("Only .xlsx files are accepted.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadExcel(file);
      onUploadSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 fade-in">
      <h2
        className="font-mono-data text-xs tracking-widest text-[var(--text-muted)] uppercase mb-4"
      >
        Data Ingestion
      </h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent-cyan)" : "var(--border)"}`,
          borderRadius: 10,
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: dragging ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.01)",
        }}
      >
        {/* Upload icon */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dragging ? "var(--accent-cyan)" : "var(--text-muted)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke 0.2s" }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
            {file ? file.name : "Drop your inventory .xlsx here"}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 4 }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB selected` : "or click to browse"}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            color: "#FCA5A5",
            fontSize: "0.82rem",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          id="upload-submit-btn"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Uploading…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Process File
            </>
          )}
        </button>
      </div>
    </div>
  );
}
