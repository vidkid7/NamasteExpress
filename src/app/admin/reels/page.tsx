"use client";

import { useRef, useState, useEffect } from "react";
import { Clapperboard } from "lucide-react";

export const dynamic = "force-dynamic";

interface Reel {
  id: string;
  title: string;
  slug: string;
  video_url: string;
  thumbnail?: string | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [message, setMessage] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    loadReels();
  }, []);

  async function loadReels() {
    const res = await fetch("/api/v1/reels?pageSize=50&includeInactive=true");
    const json = await res.json();
    if (json.success) setReels(json.data.data || []);
  }

  async function createReel(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/v1/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, video_url: videoUrl, thumbnail: thumbnail || undefined, description: description || undefined }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Reel created!");
      setTitle(""); setSlug(""); setVideoUrl(""); setThumbnail(""); setDescription("");
      loadReels();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function updateReel(id: string) {
    setMessage("");
    const res = await fetch(`/api/v1/reels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, video_url: editVideoUrl, thumbnail: editThumbnail || null, is_active: editActive }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Reel updated!");
      setEditingId(null);
      loadReels();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function deleteReel(id: string) {
    if (!confirm("Delete this reel?")) return;
    const res = await fetch(`/api/v1/reels/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setMessage("Reel deleted!");
      loadReels();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function uploadThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", title || "reel thumbnail");

    try {
      const res = await fetch("/api/v1/media", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setThumbnail(json.data.url);
        setMessage("Thumbnail uploaded!");
      } else {
        setMessage(json.error || "Upload failed");
      }
    } catch {
      setMessage("Upload error");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  }

  // Uploads a video file to Cloudinary (via the media endpoint) and returns its URL.
  async function uploadVideoFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", title || "reel video");
    const res = await fetch("/api/v1/media", { method: "POST", body: formData });
    const json = await res.json();
    if (json.success) return json.data.url as string;
    setMessage(json.error || "Video upload failed");
    return null;
  }

  async function uploadVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setMessage("Uploading video, please wait...");
    try {
      const url = await uploadVideoFile(file);
      if (url) {
        setVideoUrl(url);
        setMessage("Video uploaded!");
      }
    } catch {
      setMessage("Upload error");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function uploadEditVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploadingVideo(true);
    setMessage("Uploading video, please wait...");
    try {
      const url = await uploadVideoFile(file);
      if (url) {
        setEditVideoUrl(url);
        setMessage("Video uploaded!");
      }
    } catch {
      setMessage("Upload error");
    } finally {
      setEditUploadingVideo(false);
      if (editVideoInputRef.current) editVideoInputRef.current.value = "";
    }
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold"><span className="inline-flex items-center gap-2"><Clapperboard className="h-6 w-6" />Reels Management</span></h1>

      {message && (
        <div className="p-3 rounded-md text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          {message}
        </div>
      )}

      {/* Create Form */}
      <div className="p-4 space-y-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-semibold">Create Reel</h2>
        <form onSubmit={createReel} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-md text-sm" style={inputStyle} required />
          <input type="text" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)}
            className="px-3 py-2 rounded-md text-sm" style={inputStyle} required />
          <div className="flex gap-2">
            <input type="url" placeholder="Video URL or upload..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} required />
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={uploadVideo} />
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}
              className="px-3 py-2 rounded-md text-sm font-medium shrink-0" style={{ background: "var(--primary)", color: "#fff", opacity: uploadingVideo ? 0.6 : 1 }}>
              {uploadingVideo ? "..." : "Upload"}
            </button>
          </div>
          <div className="flex gap-2">
            <input type="url" placeholder="Thumbnail URL (optional)" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
              className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} />
            <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={uploadThumbnail} />
            <button type="button" onClick={() => thumbnailInputRef.current?.click()} disabled={uploadingThumbnail}
              className="px-3 py-2 rounded-md text-sm font-medium" style={{ background: "var(--accent)", color: "#fff", opacity: uploadingThumbnail ? 0.6 : 1 }}>
              {uploadingThumbnail ? "..." : "Upload"}
            </button>
          </div>
          <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 rounded-md text-sm col-span-full" style={inputStyle} />
          <p className="text-xs col-span-full" style={{ color: "var(--muted)" }}>
            Paste a YouTube/video URL, or upload an MP4/WebM file (max 100MB) — it will be stored on Cloudinary.
          </p>
          <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Create Reel
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Title</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Views</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reels.map((reel) => (
              <tr key={reel.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-medium">
                  {editingId === reel.id ? (
                    <div className="space-y-2">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="px-2 py-1 rounded text-sm w-full" style={inputStyle} />
                      <div className="flex gap-1">
                        <input type="url" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)}
                          className="min-w-0 flex-1 px-2 py-1 rounded text-xs" style={inputStyle} placeholder="Video URL" />
                        <input ref={editVideoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={uploadEditVideo} />
                        <button type="button" onClick={() => editVideoInputRef.current?.click()} disabled={editUploadingVideo}
                          className="px-2 py-1 rounded text-xs font-medium shrink-0" style={{ background: "var(--primary)", color: "#fff", opacity: editUploadingVideo ? 0.6 : 1 }}>
                          {editUploadingVideo ? "..." : "Upload"}
                        </button>
                      </div>
                      <input type="url" value={editThumbnail} onChange={(e) => setEditThumbnail(e.target.value)}
                        className="px-2 py-1 rounded text-xs w-full" style={inputStyle} placeholder="Thumbnail URL" />
                    </div>
                  ) : (
                    reel.title
                  )}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{reel.view_count.toLocaleString()}</td>
                <td className="p-3">
                  {editingId === reel.id ? (
                    <select value={editActive ? "true" : "false"} onChange={(e) => setEditActive(e.target.value === "true")}
                      className="px-2 py-1 rounded text-xs" style={inputStyle}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{ background: reel.is_active ? "#16a34a" : "#6b7280", color: "#fff" }}>
                      {reel.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {new Date(reel.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {editingId === reel.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => updateReel(reel.id)}
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
                        setEditingId(reel.id);
                        setEditTitle(reel.title);
                        setEditVideoUrl(reel.video_url);
                        setEditThumbnail(reel.thumbnail || "");
                        setEditActive(reel.is_active);
                      }}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                        Edit
                      </button>
                      <button onClick={() => deleteReel(reel.id)}
                        className="px-2 py-1 rounded text-xs font-medium" style={{ background: "#dc2626", color: "#fff" }}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reels.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>No reels yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
