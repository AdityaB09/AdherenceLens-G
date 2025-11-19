"use client";

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

export function PatientSummaryCard({ patient, riskLevel, riskScore }: PatientSummaryCardProps) {
  return (
    <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4 space-y-2">
      <h2 className="text-sm font-semibold">Patient summary</h2>
      <div className="text-lg font-semibold">{patient.name}</div>
      <p className="text-xs text-slate-400">
        {patient.age} · {patient.gender} · {patient.primaryCondition}
      </p>
      <div className="mt-4">
        <p className="text-xs text-slate-400 mb-1">Adherence risk</p>
        <div className="flex items-center gap-3">
          <RiskChip level={riskLevel} />
          <span className="text-xs text-slate-300">
            Score: <span className="font-mono">{riskScore.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskChip({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  if (level === "HIGH") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-900 text-rose-200 text-xs">
        High risk
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-900 text-amber-200 text-xs">
        Medium risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900 text-emerald-200 text-xs">
      Low risk
    </span>
  );
}
