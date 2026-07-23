"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  _count: { articles: number };
}

interface AdminCategoryManagerProps {
  categories: Category[];
}

const emptyForm = {
  name: "",
  name_en: "",
  slug: "",
  description: "",
  color: "#c62828",
  sort_order: 0,
  is_active: true,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminCategoryManager({ categories }: AdminCategoryManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      name_en: category.name_en ?? "",
      slug: category.slug,
      description: category.description ?? "",
      color: category.color,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? "Category updated." : "Category created.");
        resetForm();
        router.refresh();
      } else {
        setMessage(data.error || "Category save failed.");
      }
    } catch {
      setMessage("Network error while saving category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCategory(category: Category) {
    if (!confirm(`Delete "${category.name}" category?`)) return;
    setMessage("");
    const res = await fetch(`/api/v1/categories?id=${category.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setMessage("Category deleted.");
      router.refresh();
    } else {
      setMessage(data.error || "Category delete failed.");
    }
  }

  return (
    <>
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Category" : "Create Category"}</h2>
        {message && (
          <div className="p-3 rounded-md text-sm mb-4" style={{ background: "var(--surface-alt)", color: "var(--foreground)" }}>
            {message}
          </div>
        )}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({ ...prev, name, slug: editingId ? prev.slug : slugify(name) }));
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
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-3">
            <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Saving..." : editingId ? "Update Category" : "Create Category"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Name</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Slug</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Color</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Sort Order</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Articles</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{cat.slug}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-5 h-5 rounded-full border" style={{ background: cat.color, borderColor: "var(--border)" }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{cat.color}</span>
                  </div>
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{cat.sort_order}</td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{cat._count.articles}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full" style={{ background: cat.is_active ? "#16a34a" : "#6b7280", color: "#fff" }}>
                    {cat.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(cat)} className="btn-secondary btn-sm">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeCategory(cat)} className="btn-danger btn-sm" disabled={cat._count.articles > 0}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
