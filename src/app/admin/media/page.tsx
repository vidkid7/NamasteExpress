"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  Image as ImageIcon,
  Clapperboard,
  FileText,
  Plus,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string | null;
  created_at: string;
  uploader?: { name: string | null };
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const loadFiles = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/v1/media?${params}`);
    const json = await res.json();
    if (json.success) {
      setFiles(json.data.data || []);
      setTotal(json.data.total || 0);
    }
  }, [page, search]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setMessage("File uploaded!");
        loadFiles();
      } else {
        setMessage(json.error || "Upload failed");
      }
    } catch {
      setMessage("Upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleUrlAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { setMessage("Invalid URL"); return; }

    setAddingUrl(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("URL added to library!");
        setUrlInput("");
        loadFiles();
      } else {
        setMessage(json.error || "Failed to add URL");
      }
    } catch {
      setMessage("Error adding URL");
    } finally {
      setAddingUrl(false);
    }
  }

  async function updateAltText(id: string) {
    const res = await fetch(`/api/v1/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: editAltText }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Alt text updated!");
      setEditingId(null);
      loadFiles();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/v1/media/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setMessage("File deleted!");
      loadFiles();
    } else {
      setMessage(json.error || "Error");
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const totalPages = Math.ceil(total / pageSize);

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold"><span className="inline-flex items-center gap-2"><ImageIcon className="h-6 w-6" />Media Library</span></h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,.pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-2 rounded-md text-sm font-medium sm:w-auto"
            style={{ background: "var(--accent)", color: "#fff", opacity: uploading ? 0.5 : 1 }}
          >
            {uploading ? "Uploading..." : <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Upload File</span>}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-md text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          {message}
        </div>
      )}

      {/* Add by URL */}
      <div className="p-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--muted)" }}>Or add by URL</p>
        <form onSubmit={handleUrlAdd} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm"
            style={inputStyle}
          />
          <button type="submit" disabled={addingUrl || !urlInput.trim()}
            className="w-full px-4 py-2 rounded-md text-sm font-medium sm:w-auto"
            style={{ background: "var(--accent)", color: "#fff", opacity: addingUrl || !urlInput.trim() ? 0.5 : 1 }}>
            {addingUrl ? "Adding..." : "Add URL"}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="p-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadFiles(); }} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm"
            style={inputStyle}
          />
          <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium sm:w-auto"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Search
          </button>
        </form>
      </div>

      {/* Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="rounded-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="aspect-square relative" style={{ background: "var(--border)" }}>
                {file.mime_type.startsWith("image/") ? (
                  <ImageWithFallback
                    src={file.url}
                    alt={file.alt_text || file.original_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    unoptimized
                  />
                ) : file.mime_type.startsWith("video/") ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Clapperboard className="h-10 w-10" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {file.original_name}
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{formatSize(file.size)}</p>
                {editingId === file.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editAltText}
                      onChange={(e) => setEditAltText(e.target.value)}
                      placeholder="Alt text"
                      className="flex-1 px-1 py-0.5 rounded text-xs"
                      style={inputStyle}
                    />
                    <button onClick={() => updateAltText(file.id)}
                      className="px-1 py-0.5 rounded text-xs" style={{ background: "#16a34a", color: "#fff" }}><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)}
                      className="px-1 py-0.5 rounded text-xs" style={{ background: "#6b7280", color: "#fff" }}><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(file.id); setEditAltText(file.alt_text || ""); }}
                      className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--border)", color: "var(--foreground)" }}>
                      Edit
                    </button>
                    <button onClick={() => deleteFile(file.id)}
                      className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#dc2626", color: "#fff" }}>
                      Del
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          No media files found
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 && (
            <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-md text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              <span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Previous</span>
            </button>
          )}
          <span className="text-sm px-3" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-md text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
              <span className="inline-flex items-center gap-1">Next<ArrowRight className="h-4 w-4" /></span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
