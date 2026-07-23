"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionHeaderProps {
  titleKey: string;
  color: string;
  href?: string;
}

export function SectionHeader({ titleKey, color, href }: SectionHeaderProps) {
  const { t } = useLanguage();
  const title = t(titleKey);
  const viewAll = t("common.viewAll");

  return (
    <div className="flex items-center justify-between gap-4 mb-4 pb-2.5 border-b border-border">
      <div className="flex items-center gap-2.5">
        <span
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: "var(--font-nepali-serif)", lineHeight: "1.6", paddingTop: "0.1em" }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shrink-0"
          style={{ backgroundColor: color }}
        >
          {viewAll}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
