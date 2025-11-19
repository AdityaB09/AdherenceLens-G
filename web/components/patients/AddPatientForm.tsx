"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

interface Props {
  onCreated?: () => void;
}

export function AddPatientForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("F");
  const [condition, setCondition] = useState("Type 2 diabetes");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: age === "" ? 0 : age,
          gender,
          primaryCondition: condition,
          externalId: ""
        })
      });
      setName("");
      setAge("");
      setGender("F");
      setCondition("Type 2 diabetes");
      onCreated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-2 md:items-end mb-3 bg-slate-900/60 rounded-2xl p-3"
    >
      <div className="flex-1">
        <label className="block text-[11px] text-slate-400 mb-1">
          Patient name
        </label>
        <input
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., John Smith"
        />
      </div>
      <div>
        <label className="block text-[11px] text-slate-400 mb-1">Age</label>
        <input
          type="number"
          className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={age}
          onChange={e =>
            setAge(e.target.value === "" ? "" : Number(e.target.value))
          }
          min={0}
        />
      </div>
      <div>
        <label className="block text-[11px] text-slate-400 mb-1">
          Gender
        </label>
        <select
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={gender}
          onChange={e => setGender(e.target.value)}
        >
          <option value="F">F</option>
          <option value="M">M</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-[11px] text-slate-400 mb-1">
          Primary condition
        </label>
        <input
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={condition}
          onChange={e => setCondition(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-full text-xs bg-sky-600 hover:bg-sky-500 disabled:opacity-60 transition"
      >
        {loading ? "Adding…" : "Add patient"}
      </button>
    </form>
  );
}
