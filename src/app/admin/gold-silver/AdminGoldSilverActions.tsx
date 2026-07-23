"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGoldSilverActions() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "", fine_gold: 0, tejabi_gold: 0, silver: 0, source: "FENEGOSIDA",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/gold-silver", {
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
      + Add Price
    </button>
  );

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <h2 className="text-sm font-bold">Add Gold/Silver Price</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input type="number" placeholder="Fine Gold/tola" value={form.fine_gold || ""} onChange={e => setForm({ ...form, fine_gold: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input type="number" placeholder="Tejabi Gold/tola" value={form.tejabi_gold || ""} onChange={e => setForm({ ...form, tejabi_gold: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input type="number" placeholder="Silver/tola" value={form.silver || ""} onChange={e => setForm({ ...form, silver: +e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} required />
        <input placeholder="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
          className="text-sm px-3 py-2 rounded-lg" style={inputStyle} />
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

interface GoldSilverPrice {
  id: string;
  date: string;
  fine_gold: number | null;
  tejabi_gold: number | null;
  silver: number | null;
  source: string | null;
}

function dateInputValue(value: string) {
  return value.slice(0, 10);
}

export function AdminGoldSilverRow({ price }: { price: GoldSilverPrice }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: dateInputValue(price.date),
    fine_gold: price.fine_gold ?? 0,
    tejabi_gold: price.tejabi_gold ?? 0,
    silver: price.silver ?? 0,
    source: price.source ?? "",
  });

  const inputStyle = { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" };

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/gold-silver", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: price.id, ...form }),
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
    if (!confirm("Delete this price entry?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/gold-silver?id=${price.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr style={{ borderBottom: "1px solid var(--border)" }}>
        <td className="p-3"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} /></td>
        <td className="p-3"><input type="number" value={form.fine_gold || ""} onChange={e => setForm({ ...form, fine_gold: +e.target.value })} className="text-sm px-2 py-1 rounded w-28" style={inputStyle} /></td>
        <td className="p-3"><input type="number" value={form.tejabi_gold || ""} onChange={e => setForm({ ...form, tejabi_gold: +e.target.value })} className="text-sm px-2 py-1 rounded w-28" style={inputStyle} /></td>
        <td className="p-3"><input type="number" value={form.silver || ""} onChange={e => setForm({ ...form, silver: +e.target.value })} className="text-sm px-2 py-1 rounded w-24" style={inputStyle} /></td>
        <td className="p-3"><input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="text-sm px-2 py-1 rounded" style={inputStyle} /></td>
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
      <td className="p-3 font-medium">{new Date(price.date).toLocaleDateString()}</td>
      <td className="p-3 text-right" style={{ color: "#f59e0b" }}>{price.fine_gold ? `Rs ${price.fine_gold.toLocaleString()}` : "—"}</td>
      <td className="p-3 text-right" style={{ color: "var(--foreground)" }}>{price.tejabi_gold ? `Rs ${price.tejabi_gold.toLocaleString()}` : "—"}</td>
      <td className="p-3 text-right" style={{ color: "#64748b" }}>{price.silver ? `Rs ${price.silver.toLocaleString()}` : "—"}</td>
      <td className="p-3 text-xs" style={{ color: "var(--muted)" }}>{price.source ?? "—"}</td>
      <td className="p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">Edit</button>
          <button type="button" onClick={remove} disabled={loading} className="btn-danger btn-sm">Delete</button>
        </div>
      </td>
    </tr>
  );
}
