"use client";

import { useState, useMemo } from "react";
import { InventoryStatusItem } from "@/lib/api";

interface Props {
  items: InventoryStatusItem[];
}

type SortKey = keyof InventoryStatusItem;
type SortDir = "asc" | "desc";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "CRITICAL"
      ? "badge badge-critical"
      : status === "LOW"
      ? "badge badge-low"
      : "badge badge-ok";
  const dot =
    status === "CRITICAL" ? "#EF4444" : status === "LOW" ? "#F59E0B" : "#22C55E";
  return (
    <span className={cls}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

export default function InventoryStatusTable({ items }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [items, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === col ? 1 : 0.3 }}>
      {sortKey === col && sortDir === "desc" ? "↓" : "↑"}
    </span>
  );

  const cols: { key: SortKey; label: string }[] = [
    { key: "model", label: "Model" },
    { key: "status", label: "Status" },
    { key: "current_stock", label: "Stock" },
    { key: "predicted_demand", label: "Predicted Demand" },
    { key: "reason", label: "Reason" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                onClick={() => handleSort(c.key)}
                style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
              >
                {c.label}
                <SortIcon col={c.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => (
            <tr
              key={i}
              style={{
                background:
                  item.status === "CRITICAL"
                    ? "rgba(239,68,68,0.04)"
                    : item.status === "LOW"
                    ? "rgba(245,158,11,0.04)"
                    : "transparent",
              }}
            >
              <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {item.model}
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>{item.current_stock}</td>
              <td>{item.predicted_demand}</td>
              <td style={{ maxWidth: 340, whiteSpace: "normal", lineHeight: 1.5 }}>
                {item.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
