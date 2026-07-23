"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminBreakingNewsForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    article_id: "",
    expires_at: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/admin/breaking-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          article_id: form.article_id || null,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ title: "", article_id: "", expires_at: "" });
        router.refresh();
      } else {
        setError(data.error || "Failed to create");
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
      <h2 className="text-lg font-semibold mb-4">Create Breaking News</h2>
      {error && (
        <div className="p-3 rounded-md text-sm mb-4" style={{ background: "#fecaca", color: "#991b1b" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Article Link (Article ID, optional)</label>
          <input
            type="text"
            value={form.article_id}
            onChange={(e) => setForm((prev) => ({ ...prev, article_id: e.target.value }))}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={inputStyle}
            placeholder="Article ID (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expires At</label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm((prev) => ({ ...prev, expires_at: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary whitespace-nowrap"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "..." : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
