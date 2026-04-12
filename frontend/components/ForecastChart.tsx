"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ForecastResult } from "@/lib/api";

interface Props {
  data: ForecastResult[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.8rem",
        }}
      >
        <p style={{ color: "var(--text-primary)", marginBottom: 6, fontWeight: 500 }}>
          {label}
        </p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ data }: Props) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="model"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          wrapperStyle={{
            paddingTop: 16,
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        />
        <Bar
          dataKey="current_stock"
          name="Current Stock"
          fill="var(--accent-cyan)"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
        <Bar
          dataKey="predicted_demand"
          name="Predicted Demand"
          fill="#F59E0B"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
