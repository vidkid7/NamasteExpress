"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  isActive: boolean;
  title?: string;
  articleId?: string | null;
  expiresAt?: string | null;
}

export function AdminBreakingNewsToggle({ id, isActive, title = "", articleId = null, expiresAt = null }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editArticleId, setEditArticleId] = useState(articleId ?? "");
  const [editExpiresAt, setEditExpiresAt] = useState(expiresAt ? expiresAt.slice(0, 16) : "");

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/breaking-news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/breaking-news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          article_id: editArticleId || null,
          expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this breaking news item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/breaking-news/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div className="min-w-[260px] space-y-2">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="input"
          placeholder="Title"
        />
        <input
          value={editArticleId}
          onChange={(e) => setEditArticleId(e.target.value)}
          className="input"
          placeholder="Article ID"
        />
        <input
          type="datetime-local"
          value={editExpiresAt}
          onChange={(e) => setEditExpiresAt(e.target.value)}
          className="input"
        />
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={loading || !editTitle.trim()} className="btn-primary btn-sm">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary btn-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className="px-2 py-1 text-xs rounded font-medium"
        style={{
          background: isActive ? "#dc2626" : "#16a34a",
          color: "#fff",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "..." : isActive ? "Deactivate" : "Activate"}
      </button>
      <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm">
        Edit
      </button>
      <button type="button" onClick={remove} disabled={loading} className="btn-danger btn-sm">
        Delete
      </button>
    </div>
  );
}
