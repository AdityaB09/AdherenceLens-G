"use client";

interface Props {
  risk: {
    score: number;
    level: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];
    suggestions: string[];
  } | null;
  analysis?: {
    createdAt: string;
  } | null;
}

export function RiskExplanationPanel({ risk, analysis }: Props) {
  const reasons = risk?.reasons ?? [];
  const suggestions = risk?.suggestions ?? [];

  return (
    <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Risk explanation</h2>
        {analysis?.createdAt && (
          <span className="text-[10px] text-slate-500">
            Last analyzed: {new Date(analysis.createdAt).toLocaleString()}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-400">Why is this patient at this risk level?</p>
        <div className="flex flex-wrap gap-2">
          {reasons.length === 0 && (
            <span className="text-xs text-slate-500">No explanation available yet.</span>
          )}
          {reasons.map((r, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-400">Coaching suggestions</p>
        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
          {suggestions.length === 0 && (
            <li className="text-slate-500">Run analysis to generate suggestions.</li>
          )}
          {suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
