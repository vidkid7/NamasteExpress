"use client";

import { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  Plus,
  MapPin,
  PanelTop,
  PanelRight,
  FileText,
  BarChart3,
  PanelBottom,
  MessageSquare,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/client-media-upload";
import { getAdImageSrc } from "@/lib/ad-image";
import { AD_SIZE_OPTIONS, normalizeAdSize, type AdSize } from "@/lib/ad-sizes";

export const dynamic = "force-dynamic";

interface Ad {
  id: string;
  title: string;
  image_url?: string | null;
  target_url: string;
  impressions: number;
  clicks: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  ad_size?: AdSize | string | null;
  created_at: string;
  position: { id: string; name: string; type: string };
}

interface AdPosition {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

const AD_POSITION_TYPES = [
  { value: "HEADER", label: "Header Banner", icon: <PanelTop className="h-4 w-4" /> },
  { value: "SIDEBAR", label: "Sidebar", icon: <PanelRight className="h-4 w-4" /> },
  { value: "IN_ARTICLE", label: "In Article", icon: <FileText className="h-4 w-4" /> },
  { value: "BETWEEN_SECTIONS", label: "Between Sections", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "FOOTER", label: "Footer", icon: <PanelBottom className="h-4 w-4" /> },
  { value: "POPUP", label: "Popup", icon: <MessageSquare className="h-4 w-4" /> },
];

function getAdminPreviewSrc(ad: Ad) {
  if (!ad.image_url) return null;

  const now = Date.now();
  const isPubliclyEligible =
    ad.is_active &&
    (!ad.start_date || new Date(ad.start_date).getTime() <= now) &&
    (!ad.end_date || new Date(ad.end_date).getTime() >= now);

  return isPubliclyEligible
    ? getAdImageSrc(ad.id, ad.image_url)
    : ad.image_url;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [positions, setPositions] = useState<AdPosition[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [activeTab, setActiveTab] = useState<"ads" | "positions">("ads");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ad form
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [positionId, setPositionId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adSize, setAdSize] = useState<AdSize>("MEDIUM");
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Position form
  const [posName, setPosName] = useState("");
  const [posType, setPosType] = useState("HEADER");
  const [posWidth, setPosWidth] = useState("");
  const [posHeight, setPosHeight] = useState("");

  useEffect(() => {
    loadAds();
    loadPositions();
  }, []);

  function showMessage(msg: string, type: "success" | "error" = "success") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  async function loadAds() {
    try {
      const res = await fetch("/api/v1/ads?admin=true");
      const json = await res.json();
      if (json.success) setAds(json.data || []);
    } catch { /* ignore */ }
  }

  async function loadPositions() {
    try {
      const res = await fetch("/api/v1/ads/positions");
      const json = await res.json();
      if (json.success) setPositions(json.data || []);
    } catch { /* ignore */ }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadMediaFile(file, title || "advertisement");
      if (uploaded.url) {
        setImageUrl(uploaded.url);
        showMessage("Image uploaded!");
      } else {
        showMessage("Upload failed", "error");
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Upload failed", "error");
    }
    setUploading(false);
  }

  async function createAd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(editingAdId ? `/api/v1/ads/${editingAdId}` : "/api/v1/ads", {
      method: editingAdId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, image_url: imageUrl || undefined, target_url: targetUrl,
        position_id: positionId, start_date: startDate || undefined, end_date: endDate || undefined,
        ad_size: adSize,
      }),
    });
    const json = await res.json();
    if (json.success) {
      showMessage(editingAdId ? "Ad updated successfully!" : "Ad created successfully!");
      setTitle(""); setImageUrl(""); setTargetUrl(""); setPositionId(""); setStartDate(""); setEndDate(""); setAdSize("MEDIUM"); setEditingAdId(null);
      loadAds();
    } else {
      showMessage(json.error || "Error creating ad", "error");
    }
  }

  function startEditAd(ad: Ad) {
    setEditingAdId(ad.id);
    setTitle(ad.title);
    setImageUrl(ad.image_url || "");
    setTargetUrl(ad.target_url);
    setPositionId(ad.position.id);
    setStartDate(ad.start_date ? ad.start_date.slice(0, 10) : "");
    setEndDate(ad.end_date ? ad.end_date.slice(0, 10) : "");
    setAdSize(normalizeAdSize(ad.ad_size));
    setActiveTab("ads");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createPosition(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/v1/ads/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: posName, type: posType,
        width: posWidth ? parseInt(posWidth) : undefined,
        height: posHeight ? parseInt(posHeight) : undefined,
      }),
    });
    const json = await res.json();
    if (json.success) {
      showMessage("Position created!");
      setPosName(""); setPosType("HEADER"); setPosWidth(""); setPosHeight("");
      loadPositions();
    } else {
      showMessage(json.error || "Error", "error");
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    const res = await fetch(`/api/v1/ads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !currentActive }),
    });
    const json = await res.json();
    if (json.success) loadAds();
    else showMessage(json.error || "Error", "error");
  }

  async function deleteAd(id: string) {
    if (!confirm("Delete this ad?")) return;
    const res = await fetch(`/api/v1/ads/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showMessage("Ad deleted!"); loadAds(); }
    else showMessage(json.error || "Error", "error");
  }

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const inputCls = "px-3 py-2.5 rounded-lg text-sm w-full";
  const inputStyle = { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-tight" style={{ color: "var(--foreground)" }}><span className="inline-flex items-center gap-2"><Megaphone className="h-6 w-6" />Ad Management</span></h1>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button onClick={() => setActiveTab("ads")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ads" ? "text-white" : ""}`}
            style={{ background: activeTab === "ads" ? "var(--primary)" : "var(--surface)", color: activeTab === "ads" ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
            Advertisements
          </button>
          <button onClick={() => setActiveTab("positions")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "positions" ? "text-white" : ""}`}
            style={{ background: activeTab === "positions" ? "var(--primary)" : "var(--surface)", color: activeTab === "positions" ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
            Positions
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg text-sm font-medium animate-fadeIn"
          style={{ background: messageType === "success" ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)", border: `1px solid ${messageType === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`, color: messageType === "success" ? "#16a34a" : "#dc2626" }}>
          <span className="inline-flex items-center gap-2">{messageType === "success" ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}{message}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Ads", value: ads.length, color: "var(--primary)" },
          { label: "Active", value: ads.filter(a => a.is_active).length, color: "#16a34a" },
          { label: "Positions", value: positions.length, color: "#7c3aed" },
          { label: "Impressions", value: totalImpressions.toLocaleString(), color: "#ea580c" },
          { label: "CTR", value: `${overallCTR}%`, color: "#0891b2" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xl sm:text-2xl font-bold break-words" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {activeTab === "ads" ? (
        <>
          {/* Create Ad Form */}
          <div className="p-5 rounded-xl space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{editingAdId ? "Edit Advertisement" : "Create Advertisement"}</h2>
              {editingAdId && <button type="button" onClick={() => { setEditingAdId(null); setTitle(""); setImageUrl(""); setTargetUrl(""); setPositionId(""); setStartDate(""); setEndDate(""); setAdSize("MEDIUM"); }} className="text-sm" style={{ color: "var(--muted)" }}>Cancel edit</button>}
            </div>
            <form onSubmit={createAd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ad title" className={inputCls} style={inputStyle} required />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Position *</label>
                <select value={positionId} onChange={(e) => setPositionId(e.target.value)} className={inputCls} style={inputStyle} required>
                  <option value="">Select position...</option>
                  {positions.filter(p => p.is_active).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Target URL *</label>
                <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} required />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Display size *</label>
                <select value={adSize} onChange={(e) => setAdSize(e.target.value as AdSize)} className={inputCls} style={inputStyle}>
                  {AD_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label} — {option.description}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>Maximum width only; the full image ratio is always preserved.</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL or upload..." className={`${inputCls} flex-1`} style={inputStyle} />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium shrink-0 w-full sm:w-auto" style={{ background: "var(--primary)", color: "#fff", opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? "Uploading..." : <span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" />Upload</span>}
                  </button>
                </div>
                {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 max-h-20 rounded-lg" />}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={inputStyle} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2.5 rounded-lg text-sm font-bold"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  <span className="inline-flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" />{editingAdId ? "Update Ad" : "Create Ad"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ads Table */}
          <div className="overflow-x-auto rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  {["Title", "Position", "Size", "Preview", "Impressions", "Clicks", "CTR", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left p-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => {
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={ad.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-primary-light transition-colors">
                      <td className="p-3 font-medium" style={{ color: "var(--foreground)" }}>{ad.title}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                          {ad.position.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>
                          {normalizeAdSize(ad.ad_size)}
                        </span>
                      </td>
                      <td className="p-3">
                        {(() => {
                          const previewSrc = getAdminPreviewSrc(ad);
                          return previewSrc ? (
                            <img
                              src={previewSrc}
                              alt=""
                              onError={(event) => {
                                if (ad.image_url && event.currentTarget.src !== ad.image_url) {
                                  event.currentTarget.src = ad.image_url;
                                }
                              }}
                              className="h-8 w-auto max-w-32 rounded object-contain"
                            />
                          ) : <span className="text-xs" style={{ color: "var(--muted)" }}>No image</span>;
                        })()}
                      </td>
                      <td className="p-3 font-mono" style={{ color: "var(--muted)" }}>{ad.impressions.toLocaleString()}</td>
                      <td className="p-3 font-mono" style={{ color: "var(--muted)" }}>{ad.clicks.toLocaleString()}</td>
                      <td className="p-3 font-mono font-medium" style={{ color: parseFloat(ctr) > 2 ? "#16a34a" : "var(--muted)" }}>{ctr}%</td>
                      <td className="p-3">
                        <button onClick={() => toggleActive(ad.id, ad.is_active)}
                          className="px-2.5 py-1 text-xs font-bold rounded-full cursor-pointer transition-all"
                          style={{ background: ad.is_active ? "#16a34a" : "#6b7280", color: "#fff" }}>
                          {ad.is_active ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => startEditAd(ad)}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--border)" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteAd(ad.id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {ads.length === 0 && (
                  <tr><td colSpan={9} className="p-12 text-center" style={{ color: "var(--muted)" }}>
                    <p className="flex justify-center mb-2"><Megaphone className="h-8 w-8" /></p>
                    <p>No ads yet. Create your first advertisement above.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Create Position Form */}
          <div className="p-5 rounded-xl space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Create Ad Position</h2>
            <form onSubmit={createPosition} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Position Name *</label>
                <input type="text" value={posName} onChange={(e) => setPosName(e.target.value)} placeholder="e.g. home-header" className={inputCls} style={inputStyle} required />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Type *</label>
                <select value={posType} onChange={(e) => setPosType(e.target.value)} className={inputCls} style={inputStyle}>
                  {AD_POSITION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Width (px)</label>
                <input type="number" value={posWidth} onChange={(e) => setPosWidth(e.target.value)} placeholder="728" className={inputCls} style={inputStyle} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Height (px)</label>
                  <input type="number" value={posHeight} onChange={(e) => setPosHeight(e.target.value)} placeholder="90" className={inputCls} style={inputStyle} />
                </div>
                <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-bold shrink-0 w-full sm:w-auto"
                  style={{ background: "var(--primary)", color: "#fff" }}>
                  <span className="inline-flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* Positions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((pos) => (
              <div key={pos.id} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                    {pos.type}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${pos.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{pos.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {ads.filter(a => a.position.id === pos.id).length} ads assigned
                </p>
              </div>
            ))}
            {positions.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                <p className="flex justify-center mb-2"><MapPin className="h-8 w-8" /></p>
                <p>No positions yet. Create positions for ad placement.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
