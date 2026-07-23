"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { timeAgo } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  published_at?: string | Date | null;
  category: { name: string; name_en?: string | null; slug: string; color: string };
}

interface Province {
  key: string;
  ne: string;
  en: string;
  slug: string;
  color: string;
}

const PROVINCES: Province[] = [
  { key: "bagmati",      ne: "बाग्मती",       en: "Bagmati",       slug: "bagmati-pradesh",       color: "#c62828" },
  { key: "koshi",        ne: "कोशी",          en: "Koshi",         slug: "koshi-pradesh",         color: "#1565c0" },
  { key: "madhesh",      ne: "मधेश",          en: "Madhesh",       slug: "madhesh-pradesh",       color: "#2e7d32" },
  { key: "gandaki",      ne: "गण्डकी",        en: "Gandaki",       slug: "gandaki-pradesh",       color: "#6a1b9a" },
  { key: "lumbini",      ne: "लुम्बिनी",      en: "Lumbini",       slug: "lumbini-pradesh",       color: "#e65100" },
  { key: "karnali",      ne: "कर्णाली",       en: "Karnali",       slug: "karnali-pradesh",       color: "#00695c" },
  { key: "sudurpaschim", ne: "सुदूरपश्चिम",   en: "Sudurpaschim",  slug: "sudurpaschim-pradesh",  color: "#4e342e" },
];

interface ProvincialNewsProps {
  articlesByProvince: Record<string, Article[]>;
}

export function ProvincialNews({ articlesByProvince }: ProvincialNewsProps) {
  const { language } = useLanguage();
  const [activeProvince, setActiveProvince] = useState(PROVINCES[0].key);

  const active = PROVINCES.find((p) => p.key === activeProvince)!;
  const articles = articlesByProvince[activeProvince] ?? [];

  const title = (a: Article) =>
    language === "en" && a.title_en ? a.title_en : a.title;
  const catName = (a: Article) =>
    language === "en" && a.category.name_en ? a.category.name_en : a.category.name;

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill={active.color}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <h2
          className="font-bold text-base text-foreground"
          style={{ fontFamily: "var(--font-nepali-serif)" }}
        >
          {language === "ne" ? "प्रदेश समाचार" : "Provincial News"}
        </h2>
        {articles.length > 0 ? (
          <Link
            href={`/categories/${active.slug}`}
            className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full text-white transition-opacity hover:opacity-80 inline-flex items-center gap-1"
            style={{ background: active.color }}
          >
            {language === "ne" ? "सबै" : "All"}
            <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full text-muted bg-surface-alt">
            {language === "ne" ? "समाचार छैन" : "No news"}
          </span>
        )}
      </div>

      {/* Province Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border bg-surface-alt">
        {PROVINCES.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveProvince(p.key)}
            className="flex-shrink-0 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all relative"
            style={{
              color: activeProvince === p.key ? p.color : "var(--muted)",
              background: activeProvince === p.key ? "var(--surface)" : "transparent",
            }}
          >
            {language === "ne" ? p.ne : p.en}
            {activeProvince === p.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: p.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="divide-y divide-border">
        {articles.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted">
            {language === "ne" ? "समाचार उपलब्ध छैन" : "No articles available"}
          </div>
        ) : (
          articles.slice(0, 5).map((a, idx) => (
            <Link
              key={a.id}
              href={publicArticlePath(a.slug)}
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-alt"
            >
              {/* Number */}
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                style={{ background: idx === 0 ? active.color : "var(--border)", color: idx === 0 ? "#fff" : "var(--muted)" }}
              >
                {idx + 1}
              </span>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: a.category.color }}
                  >
                    {catName(a)}
                  </span>
                  {a.published_at && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted">
                        {timeAgo(new Date(a.published_at), language)}
                      </span>
                    </>
                  )}
                </div>
                <p
                  className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors"
                  style={{ lineHeight: "1.6", paddingTop: "0.05em" }}
                >
                  {title(a)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
