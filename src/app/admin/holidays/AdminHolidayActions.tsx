"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminHolidayActions() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", title_en: "", bs_year: 2082, bs_month: 1, bs_day: 1,
    ad_date: "", type: "public", is_public: true, description: "", description_en: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { router.refresh(); setShow(false); setForm({ ...form, title: "", title_en: "", description: "", description_en: "" }); }
    } finally { setLoading(false); }
  }

  if (!show) return (
    <button onClick={() => setShow(true)}
      className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white sm:w-auto"
      style={{ background: "var(--accent)" }}>
      + Add Holiday
    </button>
  );

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <h2 className="text-sm font-bold">Add New Holiday</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Title (Nepali)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input placeholder="Title (English)" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} />
        <div className="flex gap-2">
          <input type="number" placeholder="BS Year" value={form.bs_year} onChange={e => setForm({ ...form, bs_year: +e.target.value })}
            className="text-sm px-3 py-2 rounded-lg w-24" style={inputStyle} required />
          <input type="number" placeholder="Month" value={form.bs_month} onChange={e => setForm({ ...form, bs_month: +e.target.value })}
            className="text-sm px-3 py-2 rounded-lg w-20" style={inputStyle} required min={1} max={12} />
          <input type="number" placeholder="Day" value={form.bs_day} onChange={e => setForm({ ...form, bs_day: +e.target.value })}
            className="text-sm px-3 py-2 rounded-lg w-20" style={inputStyle} required min={1} max={32} />
        </div>
        <input type="date" placeholder="AD Date" value={form.ad_date} onChange={e => setForm({ ...form, ad_date: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle}>
          <option value="public">Public</option>
          <option value="cultural">Cultural</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
          Public Holiday
        </label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white sm:w-auto"
          style={{ background: "var(--accent)" }}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setShow(false)}
          className="w-full px-4 py-2 rounded-lg text-sm sm:w-auto" style={{ color: "var(--muted)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

interface Holiday {
  id: string;
  title: string;
  title_en: string | null;
  bs_year: number;
  bs_month: number;
  bs_day: number;
  ad_date: string;
  type: string;
  is_public: boolean;
  description: string | null;
  description_en: string | null;
}

export function AdminHolidayRow({ holiday }: { holiday: Holiday }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: holiday.title,
    title_en: holiday.title_en ?? "",
    bs_year: holiday.bs_year,
    bs_month: holiday.bs_month,
    bs_day: holiday.bs_day,
    ad_date: holiday.ad_date.slice(0, 10),
    type: holiday.type,
    is_public: holiday.is_public,
    description: holiday.description ?? "",
    description_en: holiday.description_en ?? "",
  });

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/holidays", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: holiday.id, ...form }),
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
    if (!confirm("Delete this holiday?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/holidays?id=${holiday.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: "1px solid var(--border)" }}>
        <td className="p-3">
          <div className="space-y-2">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="text-sm px-2 py-1 rounded w-full" style={inputStyle} />
            <input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} className="text-sm px-2 py-1 rounded w-full" style={inputStyle} placeholder="English title" />
          </div>
        </td>
        <td className="p-3">
          <div className="flex gap-1">
            <input type="number" value={form.bs_year} onChange={e => setForm({ ...form, bs_year: +e.target.value })} className="text-sm px-2 py-1 rounded w-20" style={inputStyle} />
            <input type="number" value={form.bs_month} onChange={e => setForm({ ...form, bs_month: +e.target.value })} className="text-sm px-2 py-1 rounded w-16" style={inputStyle} />
            <input type="number" value={form.bs_day} onChange={e => setForm({ ...form, bs_day: +e.target.value })} className="text-sm px-2 py-1 rounded w-16" style={inputStyle} />
          </div>
        </td>
        <td className="p-3"><input type="date" value={form.ad_date} onChange={e => setForm({ ...form, ad_date: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} /></td>
        <td className="p-3">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle}>
            <option value="public">Public</option>
            <option value="cultural">Cultural</option>
            <option value="restricted">Restricted</option>
            <option value="observance">Observance</option>
          </select>
        </td>
        <td className="p-3"><input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} /></td>
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
      <td className="p-3">
        <p className="font-medium">{holiday.title}</p>
        {holiday.title_en && <p className="text-xs" style={{ color: "var(--muted)" }}>{holiday.title_en}</p>}
      </td>
      <td className="p-3" style={{ color: "var(--muted)" }}>{holiday.bs_year}/{holiday.bs_month}/{holiday.bs_day}</td>
      <td className="p-3" style={{ color: "var(--muted)" }}>{new Date(holiday.ad_date).toLocaleDateString()}</td>
      <td className="p-3">
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ background: holiday.type === "public" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)", color: holiday.type === "public" ? "#dc2626" : "#f59e0b" }}>
          {holiday.type}
        </span>
      </td>
      <td className="p-3">
        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full" style={{ background: holiday.is_public ? "#16a34a" : "#6b7280", color: "#fff" }}>
          {holiday.is_public ? "Yes" : "No"}
        </span>
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
          <button type="button" onClick={remove} disabled={loading} className="btn-danger btn-sm">Delete</button>
        </div>
      </td>
    </tr>
  );
}
