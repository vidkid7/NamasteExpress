"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    title_en: "",
    slug: "",
    excerpt: "",
    content: "",
    category_id: "",
    tag_ids: [] as string[],
    featured_image: "",
    ai_summary: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    is_featured: false,
  });

  const wordCount = form.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});

    fetch("/api/v1/tags")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTags(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId: string) {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(adminPath("/articles"));
      } else {
        setError(data.error || "Failed to create article");
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>New Article</h1>

      {error && (
        <div className="p-3 rounded-md text-sm" style={{ background: "var(--error-light, #fecaca)", color: "var(--error, #991b1b)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (Nepali)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={(e) => updateField("title_en", e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                />
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {wordCount} words · ~{readingTime} min read
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">AI Summary</label>
                <textarea
                  value={form.ai_summary}
                  onChange={(e) => updateField("ai_summary", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value as typeof form.status)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div
                  className="max-h-40 overflow-y-auto p-2 rounded-md space-y-1"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {tags.length === 0 && (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>No tags available</p>
                  )}
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.tag_ids.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Featured Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.featured_image}
                    onChange={(e) => updateField("featured_image", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md text-sm"
                    style={inputStyle}
                    placeholder="https://..."
                  />
                  <label className="btn-secondary !py-2 !px-3 text-xs cursor-pointer whitespace-nowrap">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("alt_text", "featured image");
                        try {
                          const res = await fetch("/api/v1/media", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success && data.data?.url) {
                            updateField("featured_image", data.data.url);
                          }
                        } catch {}
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => updateField("is_featured", e.target.checked)}
                  />
                  <span className="text-sm font-medium">Featured Article</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Creating..." : "Create Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
