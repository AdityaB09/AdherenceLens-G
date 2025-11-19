"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

interface Features {
  numMeds: number;
  numDailyDoses: number;
  hasNightDose: boolean;
  negativePhrases: number;
  confusingPhrases: number;
}

interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  suggestions: string[];
  features: Features;
}

interface WhatIfResponse {
  baseline: RiskResult;
  whatIf: RiskResult;
  delta: number;
}

export function WhatIfPanel({
  patientId,
  baselineRisk,
  onUpdate
}: {
  patientId: number;
  baselineRisk: RiskResult | null;
  onUpdate: (risk: RiskResult) => void;
}) {
  const [numMeds, setNumMeds] = useState( baselineRisk?.features?.numMeds ?? 3 );
  const [numDoses, setNumDoses] = useState( baselineRisk?.features?.numDailyDoses ?? 2 );
  const [hasNight, setHasNight] = useState( baselineRisk?.features?.hasNightDose ?? true );
  const [loading, setLoading] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);

  async function runWhatIf() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numMeds,
          numDailyDoses: numDoses,
          hasNightDose: hasNight,
          negativePhrases: baselineRisk?.features?.negativePhrases ?? 0,
          confusingPhrases: baselineRisk?.features?.confusingPhrases ?? 0
        })
      });
      const data: WhatIfResponse = await res.json();
      setDelta(data.delta);
      onUpdate(data.whatIf);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4 space-y-3">
      <h2 className="text-sm font-semibold">What-if simulator</h2>
      <p className="text-xs text-slate-400">
        Adjust regimen complexity sliders to see how adherence risk changes.
      </p>

      <div className="space-y-2 text-xs">
        <div>
          <label className="flex justify-between mb-1">
            <span># of medications</span>
            <span className="text-slate-300 font-mono">{numMeds}</span>
          </label>
          <input
            type="range"
            min={1}
            max={6}
            value={numMeds}
            onChange={e => setNumMeds(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="flex justify-between mb-1">
            <span>Daily doses</span>
            <span className="text-slate-300 font-mono">{numDoses}</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={numDoses}
            onChange={e => setNumDoses(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span>Night-time dose</span>
          <button
            type="button"
            onClick={() => setHasNight(v => !v)}
            className={`text-xs px-3 py-1 rounded-full border ${
              hasNight ? "bg-rose-900 border-rose-700 text-rose-100" : "bg-slate-800 border-slate-600"
            }`}
          >
            {hasNight ? "Included" : "Removed"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={runWhatIf}
        disabled={loading}
        className="w-full mt-2 text-xs px-3 py-2 rounded-full bg-sky-600 hover:bg-sky-500 transition disabled:opacity-60"
      >
        {loading ? "Simulating…" : "Run what-if"}
      </button>

      {delta !== null && (
        <p className="text-xs mt-2 text-slate-300">
          New risk score change:{" "}
          <span className={delta > 0 ? "text-rose-300" : "text-emerald-300"}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(3)}
          </span>{" "}
          (higher is worse)
        </p>
      )}
    </div>
  );
}
