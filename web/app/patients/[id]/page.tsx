"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PatientSummaryCard } from "../../../components/patients/PatientSummaryCard";
import { RiskExplanationPanel } from "../../../components/patients/RiskExplanationPanel";
import { WhatIfPanel } from "../../../components/patients/WhatIfPanel";
import { AddNoteAndAnalyzePanel } from "../../../components/patients/AddNoteAndAnalyzePanel";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

interface Note {
  id: number;
  text: string;
  source: string;
  timestamp: string;
}

interface Regimen {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  active: boolean;
}

interface Analysis {
  id: number;
  patientId: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  reasons: string; // JSON array
  createdAt: string;
}

interface PatientDetailResponse {
  patient: {
    id: number;
    name: string;
    age: number;
    gender: string;
    primaryCondition: string;
  };
  notes: Note[];
  regimens: Regimen[];
  latestAnalysis?: Analysis;
}

interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  suggestions: string[];
  features: {
    numMeds: number;
    numDailyDoses: number;
    hasNightDose: boolean;
    negativePhrases: number;
    confusingPhrases: number;
  };
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<PatientDetailResponse | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function load() {
    if (!id) return;
    const res = await fetch(`${API_BASE}/patients/${id}`);
    const d: PatientDetailResponse = await res.json();
    setData(d);
    if (d.latestAnalysis) {
      try {
        const reasonsArr = JSON.parse(d.latestAnalysis.reasons || "[]");
        setRisk({
          score: d.latestAnalysis.score,
          level: d.latestAnalysis.risk,
          reasons: reasonsArr,
          suggestions: [],
          features: {
            numMeds: d.regimens.length,
            numDailyDoses: d.regimens.length,
            hasNightDose: false,
            negativePhrases: 0,
            confusingPhrases: 0
          }
        });
        setAnalysis(d.latestAnalysis);
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const latestNoteText = data?.notes?.[0]?.text ?? "";

  function handleAnalyzed(newRisk: RiskResult, newAnalysis: Analysis) {
    setRisk(newRisk);
    setAnalysis(newAnalysis);
    // also reload notes so highlight updates
    load();
  }

  return (
    <main className="space-y-4">
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <PatientSummaryCard
              patient={data.patient}
              riskLevel={risk?.level ?? (data.latestAnalysis?.risk ?? "LOW")}
              riskScore={risk?.score ?? (data.latestAnalysis?.score ?? 0)}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 rounded-2xl shadow-soft p-4">
              <h2 className="text-sm font-semibold mb-2">
                Recent note (NLP highlight)
              </h2>
              <div className="text-sm text-slate-200 max-h-56 overflow-y-auto leading-relaxed">
                {highlightText(latestNoteText)}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RiskExplanationPanel risk={risk} analysis={analysis} />
              <WhatIfPanel
                patientId={data.patient.id}
                baselineRisk={risk}
                onUpdate={setRisk}
              />
            </div>
            <AddNoteAndAnalyzePanel
              patientId={data.patient.id}
              onAnalyzed={handleAnalyzed}
            />
          </div>
        </div>
      )}
    </main>
  );
}

// NLP highlighter
const meds = ["metformin", "atorvastatin", "lisinopril", "insulin"];
const negative = ["forget", "miss", "skip", "skipped", "tired", "side", "effect"];

function highlightText(text: string) {
  if (!text) {
    return (
      <span className="text-slate-400 italic">
        No notes yet. Add a note below to start analysis.
      </span>
    );
  }

  const words = text.split(/\s+/);
  return (
    <p>
      {words.map((w, idx) => {
        const lw = w.toLowerCase();
        if (meds.some(m => lw.includes(m))) {
          return (
            <span
              key={idx}
              className="bg-sky-700/50 text-sky-100 px-1 rounded-md mr-1"
            >
              {w}
            </span>
          );
        }
        if (negative.some(n => lw.includes(n))) {
          return (
            <span
              key={idx}
              className="bg-rose-800/70 text-rose-50 px-1 rounded-md mr-1"
            >
              {w}
            </span>
          );
        }
        if (/\d+mg/i.test(w)) {
          return (
            <span
              key={idx}
              className="bg-emerald-800/50 text-emerald-50 px-1 rounded-md mr-1"
            >
              {w}
            </span>
          );
        }
        return w + " ";
      })}
    </p>
  );
}
