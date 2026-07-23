"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage, toNepaliDigits } from "@/contexts/LanguageContext";
import { timeAgo } from "@/lib/utils";
import { publicArticlePath } from "@/lib/public-articles";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface HeroArticle {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  published_at?: string | Date | null;
  view_count?: number;
  comment_count?: number;
  category: { name: string; name_en?: string | null; slug: string; color: string };
  author: { name?: string | null };
}

function displayNumber(value: number | undefined, language: "ne" | "en") {
  const safe = value ?? 0;
  return language === "ne" ? toNepaliDigits(safe) : safe.toLocaleString("en-US");
}

export function HeroDeck({ articles }: { articles: HeroArticle[] }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = articles[activeIndex] ?? articles[0];
  const rest = useMemo(() => articles.filter((_, index) => index !== activeIndex).slice(0, 4), [articles, activeIndex]);

  if (!active) return null;

  const title = (article: HeroArticle) => language === "en" && article.title_en ? article.title_en : article.title;
  const excerpt = (article: HeroArticle) => language === "en" && article.excerpt_en ? article.excerpt_en : article.excerpt;
  const category = (article: HeroArticle) => language === "en" && article.category.name_en ? article.category.name_en : article.category.name;

  return (
    <section className="w-full min-w-0">
      <div className="grid w-full min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] lg:gap-5">

        {/* ── Main hero card ── */}
        <article
          className="relative min-h-[26rem] rounded-xl overflow-hidden sm:min-h-[34rem] group"
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}
        >
          {active.featured_image ? (
            <ImageWithFallback
              src={active.featured_image}
              alt={title(active)}
              fill
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              style={{ transform: "scale(1.01)" }}
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-foreground to-accent/20" />
          )}

          {/* Gradient overlay */}
          <div className="featured-card-overlay absolute inset-0" />

          {/* Top badges */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
            <span className="top-story-badge">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {language === "ne" ? "मुख्य समाचार" : "Top Story"}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-white/90"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            >
              {active.published_at ? timeAgo(new Date(active.published_at), language) : ""}
            </span>
          </div>

          {/* Content at bottom */}
          <Link href={publicArticlePath(active.slug)} className="absolute inset-x-0 bottom-0 block p-5 text-white sm:p-7">
            {/* Thin accent rule above category */}
            <span className="block w-10 h-0.5 mb-3 rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
            <span
              className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-extrabold tracking-wide"
              style={{ backgroundColor: active.category.color }}
            >
              {category(active)}
            </span>
            <h1
              className="mt-3 max-w-3xl text-2xl font-black sm:text-[2.25rem]"
              style={{ fontFamily: "var(--font-nepali-serif)", lineHeight: "1.6", paddingTop: "0.1em" }}
            >
              {title(active)}
            </h1>
            {excerpt(active) && (
              <p className="mt-2.5 max-w-2xl text-sm font-normal leading-relaxed text-white/75 sm:text-[0.9375rem] line-clamp-2">
                {excerpt(active)}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-white/60">
              {active.author.name && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {active.author.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                {displayNumber(active.view_count, language)} {language === "ne" ? "पढाइ" : "reads"}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {displayNumber(active.comment_count, language)} {language === "ne" ? "प्रतिक्रिया" : "comments"}
              </span>
            </div>
          </Link>

          {/* Slide dot indicators */}
          <div className="absolute bottom-5 right-5 hidden gap-1.5 sm:flex items-center">
            {articles.slice(0, 5).map((article, index) => (
              <button
                key={article.id}
                onClick={() => setActiveIndex(index)}
                className={`hero-dot ${index === activeIndex ? "active w-8" : "w-2"}`}
                aria-label={`${language === "ne" ? "समाचार" : "Story"} ${index + 1}`}
              />
            ))}
          </div>
        </article>

        {/* ── Side story cards ── */}
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((article, index) => (
            <button
              key={article.id}
              type="button"
              onClick={() => setActiveIndex(articles.findIndex((candidate) => candidate.id === article.id))}
              className="group grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong"
            >
              {/* Thumbnail */}
              <div className="relative min-h-[7rem] bg-surface-alt overflow-hidden">
                {article.featured_image ? (
                  <ImageWithFallback
                    src={article.featured_image}
                    alt={title(article)}
                    fill
                    className="object-cover transition-transform duration-600 group-hover:scale-[1.05]"
                    sizes="104px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-alt">
                    <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                    </svg>
                  </div>
                )}
                {/* Number badge */}
                <span
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: article.category.color }}
                >
                  {index + 2}
                </span>
              </div>

              {/* Text */}
              <div className="min-w-0 p-3 flex flex-col justify-between">
                <div>
                  <span
                    className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold text-white mb-1.5"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {category(article)}
                  </span>
                  <h2
                    className="line-clamp-3 text-sm font-bold text-foreground group-hover:text-accent transition-colors"
                    style={{ fontFamily: "var(--font-nepali-serif)", lineHeight: "1.6", paddingTop: "0.05em" }}
                  >
                    {title(article)}
                  </h2>
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-muted">
                  {article.published_at ? timeAgo(new Date(article.published_at), language) : ""}
                </p>
              </div>
              <span className="sr-only">
                {language === "ne" ? "मुख्य समाचारमा देखाउनुहोस्" : "Show as top story"} {index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
