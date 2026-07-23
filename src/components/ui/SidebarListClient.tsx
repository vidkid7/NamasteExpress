"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { toNepaliDigits } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";

interface SidebarArticle {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  view_count: number;
  comment_count: number;
  category: {
    name: string;
    name_en?: string | null;
    slug: string;
    color: string;
  };
}

export function SidebarListClient({
  titleKey,
  articles,
}: {
  titleKey: string;
  articles: SidebarArticle[];
}) {
  const { language, t } = useLanguage();

  if (!articles.length) return null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <svg className="h-3.5 w-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
        </svg>
        <h3
          className="font-bold text-sm text-foreground flex-1"
          style={{ fontFamily: "var(--font-nepali-serif)" }}
        >
          {t(titleKey)}
        </h3>
      </div>

      {/* Article list */}
      <ul className="divide-y divide-border">
        {articles.map((a, idx) => {
          const title = language === "en" && a.title_en ? a.title_en : a.title;
          const num = language === "ne" ? toNepaliDigits(idx + 1) : idx + 1;
          const catName = language === "en" && a.category.name_en ? a.category.name_en : a.category.name;

          return (
            <li key={a.id}>
              <Link
                href={publicArticlePath(a.slug)}
                className="flex gap-3 items-start px-4 py-3 group transition-colors hover:bg-surface-alt"
              >
                {/* Rank number */}
                <span
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: idx < 3 ? a.category.color : "var(--surface-alt)",
                    color: idx < 3 ? "#fff" : "var(--muted)",
                  }}
                >
                  {num}
                </span>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  {/* Category dot */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: a.category.color }}
                    />
                    <span className="text-[10px] font-semibold text-muted">{catName}</span>
                  </div>
                  <p
                    className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors"
                    style={{ lineHeight: "1.6", paddingTop: "0.05em", fontFamily: "var(--font-nepali-serif)" }}
                  >
                    {title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
