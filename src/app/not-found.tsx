"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="max-w-lg w-full">
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[9rem] font-black leading-none text-border select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-accent">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
          {t("errors.notFound")}
        </h1>
        <p className="text-muted mb-10 leading-relaxed">
          {t("errors.notFoundDesc")}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link href="/" className="btn-primary">
            {t("errors.goHome")}
          </Link>
          <Link href="/search" className="btn-secondary">
            {t("errors.search")}
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <p className="text-xs text-muted mb-4 uppercase tracking-widest font-medium">
            {t("common.noResults")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-accent transition-colors">
              {t("errors.aboutUs")}
            </Link>
            <Link href="/privacy-policy" className="hover:text-accent transition-colors">
              {t("errors.privacyPolicy")}
            </Link>
            <Link href="/terms-of-service" className="hover:text-accent transition-colors">
              {t("errors.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
