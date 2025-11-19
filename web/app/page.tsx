"use client";

import { useEffect, useState } from "react";
import { RiskDistributionChart } from "../components/charts/RiskDistributionChart";
import { PatientTable } from "../components/patients/PatientTable";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "";

export interface Patient {
  id: number;
  externalId: string;
  name: string;
  age: number;
  gender: string;
  primaryCondition: string;
  latestRisk?: RiskLevel;
  latestScore?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/patients`);
        const data = await res.json();
        setPatients(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = patients.length;
  const high = patients.filter(p => p.latestRisk === "HIGH").length;
  const medium = patients.filter(p => p.latestRisk === "MEDIUM").length;
  const low = patients.filter(p => p.latestRisk === "LOW").length;

  return (
    <main className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
          <p className="text-xs text-slate-400">Total patients</p>
          <p className="text-2xl font-semibold mt-1">{total}</p>
        </div>
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
          <p className="text-xs text-slate-400">High risk</p>
          <p className="text-2xl font-semibold mt-1 text-red-400">{high}</p>
        </div>
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
          <p className="text-xs text-slate-400">Medium risk</p>
          <p className="text-2xl font-semibold mt-1 text-amber-300">{medium}</p>
        </div>
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
          <p className="text-xs text-slate-400">Low risk</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-300">{low}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold mb-2">Risk distribution</h2>
          <RiskDistributionChart
            low={low}
            medium={medium}
            high={high}
          />
        </div>
        <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-2">Patients</h2>
          <PatientTable patients={patients} loading={loading} />
        </div>
      </section>
    </main>
  );
}
