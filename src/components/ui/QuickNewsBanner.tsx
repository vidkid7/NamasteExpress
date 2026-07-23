import Link from "next/link";
import { publicArticlePath } from "@/lib/public-articles";

interface QuickNewsBannerProps {
  title: string;
  title_en?: string | null;
  slug: string;
  categoryName: string;
  categoryColor: string;
  publishedAt?: Date | string | null;
  lang?: "ne" | "en";
}

export function QuickNewsBanner({
  title,
  title_en,
  slug,
  categoryName,
  categoryColor,
  lang = "ne",
}: QuickNewsBannerProps) {
  const displayTitle = lang === "en" && title_en ? title_en : title;

  return (
    <Link
      href={publicArticlePath(slug)}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4"
      style={{ borderLeft: `4px solid ${categoryColor}` }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-black uppercase text-white"
        style={{ background: categoryColor }}
      >
        {lang === "ne" ? "ताजा" : "LATEST"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-bold text-muted">{categoryName}</span>
        <span className="mt-0.5 block line-clamp-3 text-sm font-extrabold leading-[1.55] text-foreground transition-colors group-hover:text-accent" style={{ fontFamily: "var(--font-nepali-serif)" }}>
          {displayTitle}
        </span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-alt text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
    </Link>
  );
}
