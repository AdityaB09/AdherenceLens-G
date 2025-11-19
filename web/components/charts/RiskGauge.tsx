"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";

export function RiskGauge({
  score
}: {
  score: number; // 0–1
}) {
  const pct = Math.max(0, Math.min(1, score || 0));
  const value = Math.round(pct * 100);

  const color =
    pct >= 0.7 ? "#fb7185" : pct >= 0.4 ? "#facc15" : "#22c55e";

  const data = [{ name: "risk", value }];

  return (
    <div className="relative flex items-center justify-center">
      <RadialBarChart
        width={120}
        height={120}
        innerRadius="60%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          dataKey="value"
          tick={false}
        />
        <RadialBar
          background={{ fill: "#0f172a" }}
          dataKey="value"
          cornerRadius={999}
          fill={color}
        />
      </RadialBarChart>
      <div className="absolute text-center">
        <div className="text-xs text-slate-400">Score</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
