"use client";

import { RiskGauge } from "../../components/charts/RiskGauge";

interface PatientSummaryCardProps {
  patient: {
    id: number;
    name: string;
    age: number;
    gender: string;
    primaryCondition: string;
  };
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number;
}

export function PatientSummaryCard({
  patient,
  riskLevel,
  riskScore
}: PatientSummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 rounded-2xl shadow-soft p-4 space-y-3 border border-slate-800/60">
      <h2 className="text-sm font-semibold">Patient summary</h2>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{patient.name}</div>
          <p className="text-xs text-slate-400">
            {patient.age} · {patient.gender} · {patient.primaryCondition}
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-slate-400">Adherence risk</p>
            <div className="flex items-center gap-2">
              <RiskChip level={riskLevel} />
              <span className="text-[11px] text-slate-300">
                Current score:{" "}
                <span className="font-mono">
                  {riskScore.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <RiskGauge score={riskScore} />
        </div>
      </div>
    </div>
  );
}

function RiskChip({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  if (level === "HIGH") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-900 text-rose-200 text-[11px]">
        High risk
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-900 text-amber-200 text-[11px]">
        Medium risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900 text-emerald-200 text-[11px]">
        Low risk
    </span>
  );
}
