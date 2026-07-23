"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { publicArticlePath } from "@/lib/public-articles";
import {
  ArrowLeft,
  Trash2,
  Eye,
  MessageSquare,
  Calendar,
  Bookmark,
  Save,
  Globe,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string;
  content_en: string | null;
  featured_image: string | null;
  ai_summary: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  is_featured: boolean;
  view_count: number;
  comment_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  category: { id: string; name: string };
  author: { id: string; name: string | null };
  tags: { tag: { id: string; name: string } }[];
}

interface EditArticleFormProps {
  article: Article;
  categories: Category[];
  tags: Tag[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function EditArticleForm({ article, categories, tags }: EditArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: article.title,
    title_en: article.title_en ?? "",
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    excerpt_en: article.excerpt_en ?? "",
    content: article.content,
    content_en: article.content_en ?? "",
    featured_image: article.featured_image ?? "",
    ai_summary: article.ai_summary ?? "",
    status: article.status,
    is_featured: article.is_featured,
    category_id: article.category.id,
    tag_ids: article.tags.map((t) => t.tag.id),
  });

  const wordCount = form.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/v1/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("लेख सफलतापूर्वक अपडेट भयो!");
        router.refresh();
      } else {
        setError(data.error || "अपडेट गर्न सकिएन");
      }
    } catch {
      setError("नेटवर्क त्रुटि भयो");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`"${article.title}" लेख मेट्ने हो? यो कार्य पूर्ववत हुन सक्दैन।`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/articles/${article.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push(adminPath("/articles"));
      } else {
        setError(data.error || "मेट्न सकिएन");
        setDeleting(false);
      }
    } catch {
      setError("नेटवर्क त्रुटि भयो");
      setDeleting(false);
    }
  }

  async function handleFeaturedImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", article.title);

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        updateField("featured_image", data.data.url);
        setSuccess("फोटो अपलोड भयो। परिवर्तन सेभ गर्नुहोस्।");
      } else {
        setError(data.error || "फोटो अपलोड गर्न सकिएन");
      }
    } catch {
      setError("फोटो अपलोड गर्दा नेटवर्क त्रुटि भयो");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  const statusColors: Record<string, string> = {
    PUBLISHED: "#16a34a",
    DRAFT: "#6b7280",
    ARCHIVED: "#ca8a04",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={adminPath("/articles")} className="text-sm" style={{ color: "var(--muted)" }}>
              <span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />लेखहरू</span>
            </Link>
            <span style={{ color: "var(--muted)" }}>/</span>
            <span className="text-sm font-medium">सम्पादन</span>
          </div>
          <h1 className="text-xl font-bold leading-tight">
            {article.title.length > 60 ? article.title.substring(0, 60) + "…" : article.title}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger btn-sm shrink-0"
        >
          {deleting ? "मेटाउँदै..." : <span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4" />लेख मेट्नुहोस्</span>}
        </button>
      </div>

      {/* Article Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "भ्युज", value: article.view_count.toLocaleString(), icon: <Eye className="h-5 w-5" /> },
          { label: "टिप्पणी", value: article.comment_count.toString(), icon: <MessageSquare className="h-5 w-5" /> },
          { label: "सिर्जना", value: new Date(article.created_at).toLocaleDateString("ne-NP"), icon: <Calendar className="h-5 w-5" /> },
          {
            label: "स्थिति",
            value: article.status,
            icon: <Bookmark className="h-5 w-5" />,
            color: statusColors[article.status],
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <div className="text-lg">{stat.icon}</div>
            <div
              className="text-sm font-bold mt-0.5"
              style={{ color: stat.color || "var(--foreground)" }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-md text-sm" style={{ background: "#fecaca", color: "#991b1b" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md text-sm" style={{ background: "#bbf7d0", color: "#166534" }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">शीर्षक (नेपाली) *</label>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md text-sm"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => updateField("slug", slugify(form.title))}
                    className="btn-secondary btn-sm shrink-0"
                    title="Re-generate slug from title"
                  >
                    पुनः बनाउनुहोस्
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">सारांश (नेपाली)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt (English)</label>
                <textarea
                  value={form.excerpt_en}
                  onChange={(e) => updateField("excerpt_en", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">सामग्री (नेपाली) *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                />
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {wordCount} शब्द · ~{readingTime} मिनेट
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content (English)</label>
                <textarea
                  value={form.content_en}
                  onChange={(e) => updateField("content_en", e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">AI सारांश</label>
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

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">स्थिति</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value as typeof form.status)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                >
                  <option value="DRAFT">ड्राफ्ट</option>
                  <option value="PUBLISHED">प्रकाशित</option>
                  <option value="ARCHIVED">संग्रहित</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">वर्ग *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  className="w-full px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
                  required
                >
                  <option value="">वर्ग छान्नुहोस्</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-1">ट्यागहरू</label>
                <div
                  className="max-h-40 overflow-y-auto p-2 rounded-md space-y-1"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {tags.length === 0 && (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      कुनै ट्याग छैन —{" "}
                      <a href={adminPath("/tags")} className="underline" style={{ color: "var(--accent)" }}>
                        थप्नुहोस्
                      </a>
                    </p>
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

              {/* Featured image */}
              <div>
                <label className="block text-sm font-medium mb-1">मुख्य फोटो URL</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={form.featured_image}
                    onChange={(e) => updateField("featured_image", e.target.value)}
                    className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm"
                    style={inputStyle}
                    placeholder="https://..."
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFeaturedImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-secondary btn-sm shrink-0"
                    style={{ opacity: uploadingImage ? 0.6 : 1 }}
                  >
                    {uploadingImage ? "Uploading..." : "Upload"}
                  </button>
                </div>
                {form.featured_image && (
                  <img
                    src={form.featured_image}
                    alt="Preview"
                    className="mt-2 w-full rounded-md object-cover"
                    style={{ maxHeight: "120px" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => updateField("is_featured", e.target.checked)}
                />
                <span className="text-sm font-medium">मुख्य लेख (Featured)</span>
              </label>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "सेभ गर्दै..." : <span className="inline-flex items-center justify-center gap-2"><Save className="h-4 w-4" />परिवर्तन सेभ गर्नुहोस्</span>}
            </button>

            {/* View on site */}
            {article.status === "PUBLISHED" && (
              <a
                href={publicArticlePath(article.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center block"
              >
                <span className="inline-flex items-center justify-center gap-2"><Globe className="h-4 w-4" />साइटमा हेर्नुहोस्</span>
              </a>
            )}

            {/* Article metadata */}
            <div className="card p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                जानकारी
              </h3>
              <div className="text-xs space-y-1" style={{ color: "var(--muted)" }}>
                <p><span className="font-medium">लेखक:</span> {article.author.name}</p>
                <p><span className="font-medium">ID:</span> <code className="text-[10px]">{article.id}</code></p>
                <p>
                  <span className="font-medium">सिर्जना:</span>{" "}
                  {new Date(article.created_at).toLocaleDateString("ne-NP")}
                </p>
                {article.published_at && (
                  <p>
                    <span className="font-medium">प्रकाशित:</span>{" "}
                    {new Date(article.published_at).toLocaleDateString("ne-NP")}
                  </p>
                )}
                <p>
                  <span className="font-medium">अन्तिम अपडेट:</span>{" "}
                  {new Date(article.updated_at).toLocaleDateString("ne-NP")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
