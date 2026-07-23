"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, getSession, signOut } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import Image from "next/image";

function safeCallbackUrl(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}

function LoginForm() {
  const { t, language } = useLanguage();
  const { config } = useSiteConfig();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const adminSecret =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_SECRET_PATH) || "admin";
  const isStaffLogin =
    callbackUrl === "/admin" ||
    callbackUrl.startsWith("/admin/") ||
    callbackUrl === `/${adminSecret}` ||
    callbackUrl.startsWith(`/${adminSecret}/`);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect admins/editors/authors to admin panel; others to callbackUrl
        const session = await getSession();
        const role = session?.user?.role;
        const adminRoles = ["ADMIN", "EDITOR", "AUTHOR"];
        if (isStaffLogin && !adminRoles.includes(role ?? "")) {
          await signOut({ redirect: false });
          setError(language === "ne" ? "यो खातालाई स्टाफ प्यानल पहुँच छैन" : "This account cannot access the staff panel");
          return;
        }
        if (adminRoles.includes(role ?? "") && callbackUrl === "/") {
          window.location.href = adminSecret === "admin" ? "/admin" : "/" + adminSecret;
        } else {
          window.location.href = callbackUrl;
        }
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
            {isStaffLogin ? (language === "ne" ? "स्टाफ लगइन" : "Staff login") : t("auth.loginTitle")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {isStaffLogin
              ? (language === "ne" ? "अधिकृत स्टाफका लागि मात्र" : "Authorized staff only")
              : (language === "ne" ? "नमस्ते एक्सप्रेसमा स्वागत छ" : "Welcome to Namaste Express")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-error-light text-error text-sm border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-accent hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.login")}
          </button>
        </form>

        {!isStaffLogin && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-muted">
              <span className="px-2" style={{ background: "var(--card-bg)" }}>
                or
              </span>
            </div>
          </div>

          {googleAuthEnabled && (
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="btn-secondary w-full mt-4 gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.loginWithGoogle")}
            </button>
          )}
        </div>
        )}

        {!isStaffLogin && (
        <p className="mt-6 text-center text-sm text-muted">
          {t("auth.noAccount")}{" "}
          <Link href="/auth/register" className="text-accent hover:underline font-medium">
            {t("common.register")}
          </Link>
        </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
