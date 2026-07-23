"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface SiteSettings {
  site_name?: { ne: string; en: string };
  site_tagline?: { ne: string; en: string };
  site_logo?: string;
  primary_color?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: { ne: string; en: string };
  social_facebook?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_instagram?: string;
  social_tiktok?: string;
  features_comments?: boolean;
  features_bookmarks?: boolean;
  features_reels?: boolean;
  features_galleries?: boolean;
  [key: string]: unknown;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(flattenSettings(data.data));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function flattenSettings(raw: Record<string, unknown>): SiteSettings {
    const flat: SiteSettings = {};
    for (const [key, value] of Object.entries(raw)) {
      flat[key] = value;
    }
    return flat;
  }

  function updateSetting(key: string, value: unknown) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateNestedSetting(key: string, lang: "ne" | "en", value: string) {
    setSettings((prev) => {
      const current = (prev[key] as { ne: string; en: string } | undefined) ?? { ne: "", en: "" };
      return { ...prev, [key]: { ...current, [lang]: value } };
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Settings saved successfully");
      } else {
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full sm:w-auto"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div
          className="p-3 rounded-md text-sm"
          style={{
            background: message.includes("success") ? "#bbf7d0" : "#fecaca",
            color: message.includes("success") ? "#166534" : "#991b1b",
          }}
        >
          {message}
        </div>
      )}

      {/* Branding */}
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Branding</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site Name (Nepali)</label>
            <input
              type="text"
              value={(settings.site_name as { ne: string; en: string } | undefined)?.ne ?? ""}
              onChange={(e) => updateNestedSetting("site_name", "ne", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Name (English)</label>
            <input
              type="text"
              value={(settings.site_name as { ne: string; en: string } | undefined)?.en ?? ""}
              onChange={(e) => updateNestedSetting("site_name", "en", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline (Nepali)</label>
            <input
              type="text"
              value={(settings.site_tagline as { ne: string; en: string } | undefined)?.ne ?? ""}
              onChange={(e) => updateNestedSetting("site_tagline", "ne", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tagline (English)</label>
            <input
              type="text"
              value={(settings.site_tagline as { ne: string; en: string } | undefined)?.en ?? ""}
              onChange={(e) => updateNestedSetting("site_tagline", "en", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <div className="flex items-center gap-3">
              {(settings.site_logo as string) ? (
                <img
                  src={settings.site_logo as string}
                  alt="Current logo"
                  className="w-12 h-12 rounded-lg object-contain border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center text-lg font-bold border border-border">
                  स
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={(settings.site_logo as string) ?? ""}
                  onChange={(e) => updateSetting("site_logo", e.target.value)}
                  placeholder="Logo URL or upload below"
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={inputStyle}
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
                      formData.append("alt_text", "site logo");
                      try {
                        const res = await fetch("/api/v1/media", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.success && data.data?.url) {
                          updateSetting("site_logo", data.data.url);
                        }
                      } catch {}
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <input
              type="color"
              value={(settings.primary_color as string) ?? "#c62828"}
              onChange={(e) => updateSetting("primary_color", e.target.value)}
              className="w-16 h-9 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={(settings.contact_phone as string) ?? ""}
              onChange={(e) => updateSetting("contact_phone", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={(settings.contact_email as string) ?? ""}
              onChange={(e) => updateSetting("contact_email", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address (Nepali)</label>
            <input
              type="text"
              value={(settings.contact_address as { ne: string; en: string } | undefined)?.ne ?? ""}
              onChange={(e) => updateNestedSetting("contact_address", "ne", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address (English)</label>
            <input
              type="text"
              value={(settings.contact_address as { ne: string; en: string } | undefined)?.en ?? ""}
              onChange={(e) => updateNestedSetting("contact_address", "en", e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Social Media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "social_facebook", label: "Facebook URL" },
            { key: "social_twitter", label: "Twitter URL" },
            { key: "social_youtube", label: "YouTube URL" },
            { key: "social_instagram", label: "Instagram URL" },
            { key: "social_tiktok", label: "TikTok URL" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type="text"
                value={(settings[field.key] as string) ?? ""}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="card p-5 space-y-4">
        <h2 className="text-lg font-semibold">Feature Toggles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "features_comments", label: "Comments" },
            { key: "features_bookmarks", label: "Bookmarks" },
            { key: "features_reels", label: "Reels" },
            { key: "features_galleries", label: "Galleries" },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings[toggle.key]}
                onChange={(e) => updateSetting(toggle.key, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">{toggle.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
