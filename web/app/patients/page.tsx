"use client";

import { useEffect, useState } from "react";
import { PatientTable } from "../../components/patients/PatientTable";
import type { Patient } from "../page";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export default function PatientsPage() {
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

  return (
    <main className="space-y-4">
      <h1 className="text-lg font-semibold">All Patients</h1>
      <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
        <PatientTable patients={patients} loading={loading} />
      </div>
    </main>
  );
}
