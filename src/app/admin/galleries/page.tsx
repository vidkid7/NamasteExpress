"use client";

import { useRef, useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface GalleryData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  is_active: boolean;
  created_at: string;
  _count?: { images: number };
}

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<GalleryData[]>([]);
  const [message, setMessage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    loadGalleries();
  }, []);

  async function loadGalleries() {
    const res = await fetch("/api/v1/galleries?pageSize=50&includeInactive=true");
    const json = await res.json();
    if (json.success) setGalleries(json.data.data || []);
  }

  async function createGallery(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/v1/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        description: description || undefined,
        cover_image: coverImage || undefined,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Gallery created!");
      setTitle(""); setSlug(""); setDescription(""); setCoverImage("");
      loadGalleries();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function updateGallery(id: string) {
    setMessage("");
    const res = await fetch(`/api/v1/galleries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, is_active: editActive }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Gallery updated!");
      setEditingId(null);
      loadGalleries();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function deleteGallery(id: string) {
    if (!confirm("Delete this gallery?")) return;
    const res = await fetch(`/api/v1/galleries/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setMessage("Gallery deleted!");
      loadGalleries();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function uploadCoverImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", title || "gallery cover");

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setCoverImage(json.data.url);
        setMessage("Cover image uploaded!");
      } else {
        setMessage(json.error || "Upload failed");
      }
    } catch {
      setMessage("Upload error");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold"><span className="inline-flex items-center gap-2"><ImageIcon className="h-6 w-6" />Galleries Management</span></h1>

      {message && (
        <div className="p-3 rounded-md text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          {message}
        </div>
      )}

      {/* Create Form */}
      <div className="p-4 space-y-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-semibold">Create Gallery</h2>
        <form onSubmit={createGallery} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-md text-sm" style={inputStyle} required />
          <input type="text" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)}
            className="px-3 py-2 rounded-md text-sm" style={inputStyle} required />
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 rounded-md text-sm" style={inputStyle} />
          <div className="flex gap-2">
            <input type="url" placeholder="Cover Image URL (optional)" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
              className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={uploadCoverImage} />
            <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
              className="px-3 py-2 rounded-md text-sm font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: uploadingCover ? 0.6 : 1 }}>
              {uploadingCover ? "..." : "Upload"}
            </button>
          </div>
          <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Create Gallery
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Title</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Images</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((g) => (
              <tr key={g.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-medium">
                  {editingId === g.id ? (
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2 py-1 rounded text-sm w-full" style={inputStyle} />
                  ) : (
                    g.title
                  )}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{g._count?.images ?? 0}</td>
                <td className="p-3">
                  {editingId === g.id ? (
                    <select value={editActive ? "true" : "false"} onChange={(e) => setEditActive(e.target.value === "true")}
                      className="px-2 py-1 rounded text-xs" style={inputStyle}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{ background: g.is_active ? "#16a34a" : "#6b7280", color: "#fff" }}>
                      {g.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {new Date(g.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {editingId === g.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => updateGallery(g.id)}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "#16a34a", color: "#fff" }}>
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "#6b7280", color: "#fff" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setEditingId(g.id);
                        setEditTitle(g.title);
                        setEditActive(g.is_active);
                      }}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                        Edit
                      </button>
                      <button onClick={() => deleteGallery(g.id)}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "#dc2626", color: "#fff" }}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {galleries.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>No galleries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
