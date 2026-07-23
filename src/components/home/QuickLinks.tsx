"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const LINKS = [
  {
    href: "/patro",
    ne: "पात्रो",
    en: "Patro",
    color: "#c30000",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    ),
  },
  {
    href: "/rashifal",
    ne: "राशिफल",
    en: "Horoscope",
    color: "#7c3aed",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3L1 9l4 2.18V17h2v-4.82L9 13.4V17h2v-3l1-.54 1 .54V17h2v-3.6l2-1.22V11.18L22 9 12 3zm0 2.33l6.13 3.34L12 11.67 5.87 8.67 12 5.33z" />
      </svg>
    ),
  },
  {
    href: "/share-market",
    ne: "शेयर बजार",
    en: "Share Market",
    color: "#1e40af",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
      </svg>
    ),
  },
  {
    href: "/finance",
    ne: "वित्त",
    en: "Finance",
    color: "#15803d",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </svg>
    ),
  },
];

export function QuickLinks() {
  const { language } = useLanguage();

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          className="flex items-center gap-2 text-base font-bold text-foreground"
          style={{ fontFamily: "var(--font-nepali-serif)" }}
        >
          <span className="grid place-items-center w-6 h-6 rounded-md text-white shrink-0" style={{ background: "var(--accent)" }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          {language === "ne" ? "आजका औजार" : "Today's Tools"}
        </h3>
        <span className="hidden text-xs font-medium text-muted sm:inline">
          {language === "ne" ? "पात्रो, राशिफल, बजार र वित्त" : "Calendar · Horoscope · Market · Finance"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="quick-link-pill group"
          >
            <span
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-110"
              style={{ background: link.color }}
            >
              {link.icon}
            </span>
            <span
              className="text-sm font-semibold text-foreground truncate"
              style={{ fontFamily: "var(--font-nepali-serif)" }}
            >
              {language === "ne" ? link.ne : link.en}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
