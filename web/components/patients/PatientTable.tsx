"use client";

import Link from "next/link";
import type { Patient } from "../../app/page";

export function PatientTable({
  patients,
  loading
}: {
  patients: Patient[];
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-slate-400">Loading patients…</p>;
  }

  if (!patients.length) {
    return <p className="text-sm text-slate-400">No patients yet. Seeded demo should add one.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2 text-left">Name</th>
            <th className="py-2 text-left">Condition</th>
            <th className="py-2 text-left">Risk</th>
            <th className="py-2 text-right">Score</th>
            <th className="py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.id} className="border-b border-slate-900/60">
              <td className="py-2">{p.name}</td>
              <td className="py-2 text-slate-300">{p.primaryCondition}</td>
              <td className="py-2">
                <RiskBadge level={p.latestRisk ?? ""} />
              </td>
              <td className="py-2 text-right text-slate-300">
                {(p.latestScore ?? 0).toFixed(2)}
              </td>
              <td className="py-2 text-right">
                <Link
                  className="text-xs px-3 py-1 rounded-full bg-sky-600/80 hover:bg-sky-500 transition"
                  href={`/patients/${p.id}`}
                >
                  View detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  if (level === "HIGH") {
    return <span className="text-xs px-2 py-1 rounded-full bg-rose-900 text-rose-200">High</span>;
  }
  if (level === "MEDIUM") {
    return <span className="text-xs px-2 py-1 rounded-full bg-amber-900 text-amber-200">Medium</span>;
  }
  if (level === "LOW") {
    return <span className="text-xs px-2 py-1 rounded-full bg-emerald-900 text-emerald-200">Low</span>;
  }
  return <span className="text-xs text-slate-500">—</span>;
}
