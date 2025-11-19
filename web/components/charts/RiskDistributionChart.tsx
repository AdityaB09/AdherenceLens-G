"use client";

import { Pie, PieChart, Tooltip, Cell } from "recharts";

export function RiskDistributionChart({
  low,
  medium,
  high
}: {
  low: number;
  medium: number;
  high: number;
}) {
  const data = [
    { name: "Low", value: low },
    { name: "Medium", value: medium },
    { name: "High", value: high }
  ];

  const colors = ["#22c55e", "#facc15", "#f97373"];

  return (
    <div className="flex flex-col items-center">
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          stroke="none"
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: "0.75rem",
            border: "1px solid #1e293b",
            color: "#e2e8f0"
          }}
        />
      </PieChart>
      <div className="flex gap-3 text-xs text-slate-300 mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-300" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-400" /> High
        </span>
      </div>
    </div>
  );
}
