"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function ForgotPasswordPage() {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("common.error"));
      } else {
        setMessage(
          data.message ||
            (language === "ne"
              ? "यदि यो इमेल दर्ता छ भने, रिसेट लिंक पठाइनेछ।"
              : "If this email is registered, a reset link will be sent.")
        );
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  const siteName = language === "en" ? config.site_name.en : config.site_name.ne;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--background)" }}>
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          {config.site_logo && (
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 rounded-xl bg-white shadow-sm overflow-hidden ring-1 ring-border p-1">
                <Image src={config.site_logo} alt={siteName} fill className="object-contain" unoptimized />
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)", color: "var(--foreground)" }}>
            {language === "ne" ? "पासवर्ड रिसेट" : "Reset your password"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {language === "ne" ? "तपाईंको खातासँग जोडिएको इमेल लेख्नुहोस्" : "Enter the email linked to your account"}
          </p>
        </div>

        {message && <div className="mb-4 p-3 rounded-md bg-success-light text-success text-sm border border-success/20">{message}</div>}
        {error && <div className="mb-4 p-3 rounded-md bg-error-light text-error text-sm border border-error/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              {t("auth.email")}
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? t("common.loading") : language === "ne" ? "रिसेट लिंक पठाउनुहोस्" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/auth/login" className="text-accent hover:underline font-medium">
            {language === "ne" ? "लगइनमा फर्कनुहोस्" : "Back to login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
