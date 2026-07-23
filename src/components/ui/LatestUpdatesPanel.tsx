"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { timeAgo } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface LatestArticle {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  category: { name: string; name_en?: string | null; slug: string; color: string };
}

export function LatestUpdatesPanel() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<LatestArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchLatest = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/articles?pageSize=12&status=PUBLISHED");
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : (json.data?.data || []);
      setArticles(data);
      setFetched(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [fetched]);

  const handleOpen = () => {
    setOpen(true);
    fetchLatest();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        aria-label={t("sections.latestUpdates")}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1 px-2 py-3 rounded-l-lg shadow-lg text-white text-[11px] font-bold transition-transform hover:-translate-x-0.5"
        style={{
          background: "var(--primary)",
          writingMode: "vertical-rl",
        }}
      >
        <svg className="h-4 w-4 mb-1" style={{ writingMode: "horizontal-tb" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {language === "ne" ? "ताजा अपडेट" : "Latest"}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--surface)" }}
        aria-hidden={!open}
        role="dialog"
        aria-label={t("sections.latestUpdates")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0" style={{ background: "var(--primary)" }}>
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="live-dot" />
            {t("sections.latestUpdates")}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-12 bg-surface-alt rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-alt rounded w-full" />
                    <div className="h-3 bg-surface-alt rounded w-3/4" />
                    <div className="h-2 bg-surface-alt rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {articles.map((article) => {
                const displayTitle = language === "en" && article.title_en ? article.title_en : article.title;
                const catName = language === "en" && article.category.name_en ? article.category.name_en : article.category.name;
                const timeStr = article.published_at ? timeAgo(new Date(article.published_at), language) : null;

                return (
                  <li key={article.id}>
                    <Link
                      href={publicArticlePath(article.slug)}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 p-3 hover:bg-surface-alt transition-colors group"
                    >
                      {article.featured_image ? (
                        <div className="relative w-16 h-12 shrink-0 rounded overflow-hidden">
                          <ImageWithFallback
                            src={article.featured_image}
                            alt={displayTitle}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 shrink-0 rounded bg-surface-alt flex items-center justify-center">
                          <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" /></svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[10px] font-semibold uppercase"
                          style={{ color: article.category.color }}
                        >
                          {catName}
                        </span>
                        <h3 className="text-xs font-medium leading-snug line-clamp-3 text-foreground group-hover:text-primary transition-colors mt-0.5">
                          {displayTitle}
                        </h3>
                        {timeStr && (
                          <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            {timeStr}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 p-3 border-t border-border">
          <Link
            href="/categories/samachar"
            onClick={() => setOpen(false)}
            className="block text-center py-2 text-sm font-medium rounded-lg transition-colors text-white"
            style={{ background: "var(--primary)" }}
          >
            <span className="inline-flex items-center justify-center gap-1">
              {language === "ne" ? "२४ घण्टाका ताजा अपडेट" : "24-Hour Updates"}
              <ArrowRight className="inline h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
