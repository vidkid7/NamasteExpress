"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import Image from "next/image";

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const { config } = useSiteConfig();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(
        t("auth.confirmPassword")
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("common.error"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  const siteName = language === "en" ? config.site_name.en : config.site_name.ne;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--background)" }}>
        <div className="card w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-light flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-nepali-serif)", color: "var(--foreground)" }}>{t("common.success")}</h1>
          <p className="text-muted mb-6">{t("auth.verifyEmail")}</p>
          <Link href="/auth/login" className="btn-primary">
            {t("common.login")}
          </Link>
        </div>
      </div>
    );
  }

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
            {t("auth.registerTitle")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {language === "ne" ? "नमस्ते एक्सप्रेसमा स्वागत छ" : "Welcome to Namaste Express"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-error-light text-error text-sm border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              {t("auth.name")}
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              {t("auth.email")}
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              {t("auth.password")}
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="reg-confirm"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {t("auth.confirmPassword")}
            </label>
            <input
              id="reg-confirm"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.register")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {t("auth.hasAccount")}{" "}
          <Link href="/auth/login" className="text-accent hover:underline font-medium">
            {t("common.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
