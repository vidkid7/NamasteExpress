"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { publicArticlePath } from "@/lib/public-articles";

interface BreakingNewsItem {
  id: string;
  title: string;
  title_en?: string | null;
  article?: { slug: string } | null;
}

export function BreakingNewsTicker({ items, label = "ब्रेकिङ" }: { items: BreakingNewsItem[]; label?: string }) {
  const { language, t } = useLanguage();

  if (!items.length) return null;

  return (
    <div
      className="relative flex items-center overflow-hidden bg-accent text-white"
      role="marquee"
      aria-live="polite"
      aria-label={t("article.breakingNews")}
    >
      <span className="shrink-0 z-10 flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm bg-accent-hover whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        {label}
      </span>
      <div className="overflow-hidden flex-1 min-w-0">
        <div className="flex animate-marquee whitespace-nowrap py-2.5 hover:[animation-play-state:paused]">
          {items.concat(items).map((item, idx) => {
            const title =
              language === "en" && item.title_en ? item.title_en : item.title;
            const inner = (
              <span className="mx-6 text-sm font-medium flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/50" />
                {title}
              </span>
            );
            return item.article ? (
              <Link
                key={`${item.id}-${idx}`}
                href={publicArticlePath(item.article.slug)}
                className="hover:underline"
              >
                {inner}
              </Link>
            ) : (
              <span key={`${item.id}-${idx}`}>{inner}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
