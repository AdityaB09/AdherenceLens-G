"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

interface Props {
  patientId: number;
  onAnalyzed: (risk: any, analysis: any) => void;
}

export function AddNoteAndAnalyzePanel({ patientId, onAnalyzed }: Props) {
  const [source, setSource] = useState("discharge");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      // 1) Add note
      await fetch(`${API_BASE}/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, text })
      });

      // 2) Run analysis
      const res = await fetch(`${API_BASE}/patients/${patientId}/analyze`, {
        method: "POST"
      });
      const data = await res.json();
      onAnalyzed(data.risk, data.analysis);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/60 rounded-2xl shadow-soft p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold">Add note & re-run analysis</h2>
      <p className="text-xs text-slate-400">
        Paste a new doctor note, discharge summary, or patient message. The
        system will ingest it and recompute adherence risk.
      </p>
      <div className="flex gap-2 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Source
          </label>
          <select
            className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            <option value="discharge">Discharge</option>
            <option value="clinic">Clinic note</option>
            <option value="portal">Portal message</option>
          </select>
        </div>
      </div>
      <div>
        <textarea
          rows={4}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g., Patient reports missing evening metformin 3–4 times per week and feeling tired due to side effects..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full text-xs px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition"
      >
        {loading ? "Saving & analyzing…" : "Save note & run analysis"}
      </button>
    </form>
  );
}
