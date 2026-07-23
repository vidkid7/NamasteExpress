"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="max-w-lg w-full">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
          {t("errors.serverError")}
        </h1>
        <p className="text-muted mb-3 leading-relaxed">
          {t("errors.serverErrorDesc")}
        </p>
        {error.digest && (
          <p className="text-xs text-muted mb-8 font-mono bg-surface border border-border rounded px-3 py-1.5 inline-block">
            {t("errors.errorId")} {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-8" />}

        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">
            {t("errors.tryAgain")}
          </button>
          <Link href="/" className="btn-secondary">
            {t("errors.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
