"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage, toNepaliDigits } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { timeAgo } from "@/lib/utils";

interface BriefArticle {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  published_at?: string | Date | null;
  category: { name: string; name_en?: string | null; slug: string; color: string };
}

export function DailyBrief({ articles }: { articles: BriefArticle[] }) {
  const { language } = useLanguage();
  if (!articles.length) return null;

  const title = (article: BriefArticle) =>
    language === "en" && article.title_en ? article.title_en : article.title;
  const category = (article: BriefArticle) =>
    language === "en" && article.category.name_en
      ? article.category.name_en
      : article.category.name;

  return (
    <section
      id="daily-brief"
      className="scroll-mt-28 rounded-xl border border-border bg-surface overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Animated live dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <h2
            className="text-base font-bold text-foreground"
            style={{ fontFamily: "var(--font-nepali-serif)" }}
          >
            {language === "ne" ? "ताजा समाचार" : "Latest News"}
          </h2>
        </div>
        <Link
          href="/categories/samachar"
          className="text-[11px] font-bold text-accent hover:underline shrink-0 inline-flex items-center gap-1"
        >
          {language === "ne" ? "सबै" : "See all"}
          <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Article list — ekantipur style compact rows */}
      <ol className="divide-y divide-border">
        {articles.slice(0, 5).map((article, index) => (
          <li key={article.id}>
            <Link
              href={publicArticlePath(article.slug)}
              className="flex items-start gap-3 px-4 py-3 group transition-colors hover:bg-surface-alt"
            >
              {/* Number badge */}
              <span
                className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                style={{
                  background: index === 0 ? "var(--accent)" : "var(--surface-alt)",
                  color: index === 0 ? "#fff" : "var(--muted)",
                }}
              >
                {language === "ne" ? toNepaliDigits(index + 1) : index + 1}
              </span>

              {/* Content */}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: article.category.color }}
                  />
                  <span className="text-[10px] font-semibold" style={{ color: article.category.color }}>
                    {category(article)}
                  </span>
                  {article.published_at && (
                    <>
                      <span className="text-muted-foreground text-[10px]">·</span>
                      <span className="text-[10px] text-muted">
                        {timeAgo(new Date(article.published_at), language)}
                      </span>
                    </>
                  )}
                </span>
                <span
                  className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors"
                  style={{ fontFamily: "var(--font-nepali-serif)", lineHeight: "1.6", paddingTop: "0.05em" }}
                >
                  {title(article)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
