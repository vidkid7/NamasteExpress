"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  _count?: { articles: number };
}

interface AdminTagFormProps {
  tags: Tag[];
}

export function AdminTagForm({ tags }: AdminTagFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), name_en: nameEn.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setNameEn("");
        router.refresh();
      } else {
        setError(data.error || "ट्याग सिर्जना भएन");
      }
    } catch {
      setError("नेटवर्क त्रुटि भयो");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, tagName: string) {
    if (!confirm(`"${tagName}" ट्याग मेट्ने हो?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/admin/tags?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "ट्याग मेटिएन");
      }
    } catch {
      alert("नेटवर्क त्रुटि भयो");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim(), name_en: editNameEn.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setEditName("");
        setEditNameEn("");
        router.refresh();
      } else {
        setError(data.error || "ट्याग अपडेट भएन");
      }
    } catch {
      setError("नेटवर्क त्रुटि भयो");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Create Tag Form */}
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>
          नयाँ ट्याग थप्नुहोस् / Add New Tag
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
              नाम (नेपाली) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ट्याग नाम"
              required
              className="input"
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>
              Name (English)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Tag name in English"
              className="input"
            />
          </div>
          <button type="submit" disabled={loading || !name.trim()} className="btn-primary w-full sm:w-auto">
            {loading ? "थप्दै..." : "+ थप्नुहोस्"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>{error}</p>
        )}
      </div>

      {/* Tags Table */}
      <div className="card overflow-hidden">
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="font-semibold text-sm">
            कुल ट्यागहरू: <strong>{tags.length}</strong>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>नाम / Name</th>
                <th>English</th>
                <th>Slug</th>
                <th>लेखहरू</th>
                <th>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="font-medium">
                    {editingId === tag.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input"
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td style={{ color: "var(--muted)" }}>
                    {editingId === tag.id ? (
                      <input
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        className="input"
                      />
                    ) : (
                      tag.name_en || "—"
                    )}
                  </td>
                  <td>
                    <code
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{ background: "var(--surface-alt)", color: "var(--muted)" }}
                    >
                      {tag.slug}
                    </code>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{tag._count?.articles ?? 0}</td>
                  <td>
                    {editingId === tag.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(tag.id)}
                          disabled={loading}
                          className="btn-primary btn-sm"
                        >
                          सेभ
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn-secondary btn-sm"
                        >
                          रद्द
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(tag.id);
                            setEditName(tag.name);
                            setEditNameEn(tag.name_en || "");
                          }}
                          className="btn-secondary btn-sm"
                        >
                          सम्पादन
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
                          disabled={deletingId === tag.id}
                          className="btn-danger btn-sm"
                        >
                          {deletingId === tag.id ? "..." : "मेट्नुहोस्"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                    कुनै ट्याग भेटिएन
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
