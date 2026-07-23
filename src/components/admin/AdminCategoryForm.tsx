"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCategoryForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    name_en: "",
    slug: "",
    description: "",
    color: "#c62828",
    sort_order: 0,
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ name: "", name_en: "", slug: "", description: "", color: "#c62828", sort_order: 0 });
        router.refresh();
      } else {
        setError(data.error || "Failed to create category");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="card p-5">
      <h2 className="text-lg font-semibold mb-4">Create Category</h2>
      {error && (
        <div className="p-3 rounded-md text-sm mb-4" style={{ background: "#fecaca", color: "#991b1b" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
            }}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name (English)</label>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) => setForm((prev) => ({ ...prev, name_en: e.target.value }))}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            className="w-16 h-9 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
