"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminForexActions() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "", currency: "USD", currency_name: "", unit: 1, buy: 0, sell: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/forex", {
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
      + Add Rate
    </button>
  );

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <h2 className="text-sm font-bold">Add Forex Rate</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input placeholder="Currency Code (USD)" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input placeholder="Currency Name" value={form.currency_name} onChange={e => setForm({ ...form, currency_name: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} />
        <input type="number" placeholder="Unit" value={form.unit || ""} onChange={e => setForm({ ...form, unit: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input type="number" step="0.01" placeholder="Buy Rate (NPR)" value={form.buy || ""} onChange={e => setForm({ ...form, buy: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input type="number" step="0.01" placeholder="Sell Rate (NPR)" value={form.sell || ""} onChange={e => setForm({ ...form, sell: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
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

interface ForexRate {
  id: string;
  date: string;
  currency: string;
  currency_name: string | null;
  unit: number;
  buy: number | null;
  sell: number | null;
}

export function AdminForexRow({ rate }: { rate: ForexRate }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: rate.date.slice(0, 10),
    currency: rate.currency,
    currency_name: rate.currency_name ?? "",
    unit: rate.unit,
    buy: rate.buy ?? 0,
    sell: rate.sell ?? 0,
  });

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/forex", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rate.id, ...form }),
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
    if (!confirm("Delete this forex rate?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/forex?id=${rate.id}`, { method: "DELETE" });
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
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} />
            <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="text-sm px-2 py-1 rounded w-20" style={inputStyle} />
            <input value={form.currency_name} onChange={e => setForm({ ...form, currency_name: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} placeholder="Name" />
          </div>
        </td>
        <td className="p-3 text-center"><input type="number" value={form.unit || ""} onChange={e => setForm({ ...form, unit: +e.target.value })} className="text-sm px-2 py-1 rounded w-20" style={inputStyle} /></td>
        <td className="p-3 text-right"><input type="number" step="0.01" value={form.buy || ""} onChange={e => setForm({ ...form, buy: +e.target.value })} className="text-sm px-2 py-1 rounded w-24" style={inputStyle} /></td>
        <td className="p-3 text-right"><input type="number" step="0.01" value={form.sell || ""} onChange={e => setForm({ ...form, sell: +e.target.value })} className="text-sm px-2 py-1 rounded w-24" style={inputStyle} /></td>
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
        <span className="font-semibold">{rate.currency}</span>
        {rate.currency_name && <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{rate.currency_name}</span>}
      </td>
      <td className="p-3 text-center" style={{ color: "var(--muted)" }}>{rate.unit}</td>
      <td className="p-3 text-right font-medium">{rate.buy?.toFixed(2) ?? "—"}</td>
      <td className="p-3 text-right font-medium">{rate.sell?.toFixed(2) ?? "—"}</td>
      <td className="p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
          <button type="button" onClick={remove} disabled={loading} className="btn-danger btn-sm">Delete</button>
        </div>
      </td>
    </tr>
  );
}
