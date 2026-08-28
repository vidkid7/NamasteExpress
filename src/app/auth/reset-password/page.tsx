"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

function ResetPasswordForm() {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : language === "ne" ? "रिसेट टोकन भेटिएन" : "Reset token is missing");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError(language === "ne" ? "रिसेट टोकन भेटिएन" : "Reset token is missing");
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.confirmPassword"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("common.error"));
      } else {
        setMessage(data.message || (language === "ne" ? "पासवर्ड रिसेट भयो।" : "Password reset successfully."));
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
            {t("auth.resetPassword")}
          </h1>
        </div>

        {message && <div className="mb-4 p-3 rounded-md bg-success-light text-success text-sm border border-success/20">{message}</div>}
        {error && <div className="mb-4 p-3 rounded-md bg-error-light text-error text-sm border border-error/20">{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                {t("auth.newPassword")}
              </label>
              <input id="new-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="input" autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                {t("auth.confirmPassword")}
              </label>
              <input id="confirm-password" type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading || !token} className="btn-primary w-full disabled:opacity-50">
              {loading ? t("common.loading") : t("auth.resetPassword")}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/auth/login" className="text-accent hover:underline font-medium">
            {language === "ne" ? "लगइनमा फर्कनुहोस्" : "Back to login"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
