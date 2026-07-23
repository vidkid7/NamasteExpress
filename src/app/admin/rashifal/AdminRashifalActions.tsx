"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Star } from "lucide-react";

export function AdminRashifalActions({ signs }: { signs: string[] }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sign: "mesh", sign_ne: "मेष", ad_date: "", bs_year: 2082, bs_month: 1, bs_day: 1, prediction: "", prediction_en: "", rating: 3,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/rashifal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { router.refresh(); setShow(false); }
    } finally { setLoading(false); }
  }

  if (!show) return (
    <button onClick={() => setShow(true)}
      className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white sm:w-auto"
      style={{ background: "var(--accent)" }}>
      <span className="inline-flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Add Rashifal</span>
    </button>
  );

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <h2 className="text-sm font-bold">Add Rashifal Entry</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={form.sign} onChange={e => setForm({ ...form, sign: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle}>
          {signs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="Nepali name (e.g. मेष)" value={form.sign_ne} onChange={e => setForm({ ...form, sign_ne: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} />
        <input type="date" value={form.ad_date} onChange={e => setForm({ ...form, ad_date: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
      </div>
      <textarea placeholder="Prediction (Nepali)" value={form.prediction} onChange={e => setForm({ ...form, prediction: e.target.value })}
        className="w-full text-sm px-3 py-2 rounded-lg" style={inputStyle} rows={3} required />
      <textarea placeholder="Prediction (English)" value={form.prediction_en} onChange={e => setForm({ ...form, prediction_en: e.target.value })}
        className="w-full text-sm px-3 py-2 rounded-lg" style={inputStyle} rows={2} />
      <div className="flex items-center gap-3">
        <label className="text-sm" style={{ color: "var(--muted)" }}>Rating:</label>
        <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg w-20" style={inputStyle} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white sm:w-auto"
          style={{ background: "var(--accent)" }}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setShow(false)}
          className="w-full px-4 py-2 rounded-lg text-sm sm:w-auto" style={{ color: "var(--muted)" }}>Cancel</button>
      </div>
    </form>
  );
}

interface RashifalEntry {
  id: string;
  sign: string;
  sign_ne: string | null;
  bs_year: number;
  bs_month: number;
  bs_day: number;
  ad_date: string;
  prediction: string;
  prediction_en: string | null;
  rating: number | null;
}

export function AdminRashifalRow({ entry, signs }: { entry: RashifalEntry; signs: string[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sign: entry.sign,
    sign_ne: entry.sign_ne ?? "",
    ad_date: entry.ad_date.slice(0, 10),
    bs_year: entry.bs_year,
    bs_month: entry.bs_month,
    bs_day: entry.bs_day,
    prediction: entry.prediction,
    prediction_en: entry.prediction_en ?? "",
    rating: entry.rating ?? 3,
  });

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/rashifal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, ...form }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this rashifal entry?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/rashifal?id=${entry.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: "1px solid var(--border)" }}>
        <td className="p-3">
          <select value={form.sign} onChange={e => setForm({ ...form, sign: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle}>
            {signs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={form.sign_ne} onChange={e => setForm({ ...form, sign_ne: e.target.value })} className="mt-2 text-sm px-2 py-1 rounded w-full" style={inputStyle} />
        </td>
        <td className="p-3">
          <div className="space-y-2">
            <input type="date" value={form.ad_date} onChange={e => setForm({ ...form, ad_date: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} />
            <div className="flex gap-1">
              <input type="number" value={form.bs_year} onChange={e => setForm({ ...form, bs_year: +e.target.value })} className="text-sm px-2 py-1 rounded w-20" style={inputStyle} />
              <input type="number" value={form.bs_month} onChange={e => setForm({ ...form, bs_month: +e.target.value })} className="text-sm px-2 py-1 rounded w-16" style={inputStyle} />
              <input type="number" value={form.bs_day} onChange={e => setForm({ ...form, bs_day: +e.target.value })} className="text-sm px-2 py-1 rounded w-16" style={inputStyle} />
            </div>
          </div>
        </td>
        <td className="p-3">
          <textarea value={form.prediction} onChange={e => setForm({ ...form, prediction: e.target.value })} className="w-full text-sm px-2 py-1 rounded" style={inputStyle} rows={3} />
          <textarea value={form.prediction_en} onChange={e => setForm({ ...form, prediction_en: e.target.value })} className="mt-2 w-full text-sm px-2 py-1 rounded" style={inputStyle} rows={2} />
        </td>
        <td className="p-3 text-center"><input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} className="text-sm px-2 py-1 rounded w-16" style={inputStyle} /></td>
        <td className="p-3">
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={loading} className="btn-primary btn-sm">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td className="p-3 font-medium whitespace-nowrap">
        <Sparkles className="mr-1 inline h-4 w-4" />
        {entry.sign_ne ?? entry.sign}
      </td>
      <td className="p-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{new Date(entry.ad_date).toLocaleDateString()}</td>
      <td className="p-3 max-w-md truncate" style={{ color: "var(--foreground)" }}>{entry.prediction.slice(0, 80)}...</td>
      <td className="p-3 text-center">{entry.rating ? Array.from({ length: entry.rating }).map((_, i) => <Star key={i} className="inline h-4 w-4" />) : "—"}</td>
      <td className="p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
          <button type="button" onClick={remove} disabled={loading} className="btn-danger btn-sm">Delete</button>
        </div>
      </td>
    </tr>
  );
}
