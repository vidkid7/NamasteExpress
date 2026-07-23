"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { toNepaliDigits } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { timeAgo as sharedTimeAgo, getInitials } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface ArticleCardProps {
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  category: {
    name: string;
    name_en?: string | null;
    slug: string;
    color: string;
  };
  author: { name?: string | null };
  reading_time?: number | null;
  published_at?: string | Date | null;
  view_count?: number;
  comment_count?: number;
  variant?: "default" | "hero" | "horizontal";
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
      style={{ background: "var(--primary)" }}>
      {initials}
    </div>
  );
}

export function ArticleCard({
  slug, title, title_en, excerpt, excerpt_en, featured_image,
  category, author, reading_time, published_at, view_count = 0,
  comment_count = 0, variant = "default",
}: ArticleCardProps) {
  const { language } = useLanguage();

  const displayTitle = language === "en" && title_en ? title_en : title;
  const displayExcerpt = language === "en" && excerpt_en ? excerpt_en : excerpt;
  const catName = language === "en" && category.name_en ? category.name_en : category.name;
  const timeStr = published_at ? sharedTimeAgo(new Date(published_at), language) : null;

  if (variant === "horizontal") {
    return (
      <Link href={publicArticlePath(slug)} className="card flex w-full min-w-0 flex-row group">
        <div className="relative w-36 h-28 shrink-0">
          {featured_image ? (
            <ImageWithFallback src={featured_image} alt={displayTitle} fill
              className="object-cover rounded-l-lg group-hover:scale-105 transition-transform duration-300" sizes="144px" />
          ) : (
            <div className="w-full h-full bg-surface-alt flex items-center justify-center rounded-l-lg">
              <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>
            </div>
          )}
        </div>
        <div className="p-3 flex-1 min-w-0">
          <span className="category-badge text-xs" style={{ "--category-color": category.color } as React.CSSProperties}>
            {catName}
          </span>
          <h3 className="mt-1.5 text-sm font-semibold leading-[1.55] line-clamp-3 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-nepali-serif)" }}>
            {displayTitle}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
            {timeStr && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {timeStr}
              </span>
            )}
            {comment_count > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                {language === "ne" ? toNepaliDigits(comment_count) : comment_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link href={publicArticlePath(slug)} className="card group block w-full min-w-0 relative overflow-hidden">
        <div className="relative w-full h-72 lg:h-96">
          {featured_image ? (
            <ImageWithFallback src={featured_image} alt={displayTitle} fill
              className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" priority />
          ) : (
            <div className="w-full h-full bg-surface-alt flex items-center justify-center">
              <svg className="w-16 h-16 text-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="category-badge" style={{ "--category-color": category.color } as React.CSSProperties}>
              {catName}
            </span>
            <h2 className="mt-3 text-xl lg:text-2xl font-bold leading-[1.45] line-clamp-4 group-hover:underline decoration-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              {displayTitle}
            </h2>
            {displayExcerpt && (
              <p className="mt-2 text-sm text-white/80 line-clamp-2">{displayExcerpt}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-white/65">
              {author.name && (
                <span className="flex items-center gap-1.5">
                  <AuthorAvatar name={author.name} />
                  {author.name}
                </span>
              )}
              {timeStr && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                  {timeStr}
                </span>
              )}
              {comment_count > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                  {language === "ne" ? toNepaliDigits(comment_count) : comment_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card — magazine style
  return (
    <Link href={publicArticlePath(slug)} className="card-news group block">
      <div className="relative w-full h-48 card-news-img overflow-hidden">
        {featured_image ? (
          <ImageWithFallback src={featured_image} alt={displayTitle} fill
            className="object-cover transition-transform duration-600 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full bg-surface-alt flex items-center justify-center">
            <svg className="w-12 h-12 text-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="category-badge text-xs" style={{ "--category-color": category.color } as React.CSSProperties}>
          {catName}
        </span>
        <h3 className="mt-2 text-base font-bold leading-[1.55] line-clamp-3 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-nepali-serif)" }}>
          {displayTitle}
        </h3>
        {displayExcerpt && (
          <p className="mt-1.5 text-sm text-muted line-clamp-3 leading-relaxed">{displayExcerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          {author.name && (
            <span className="flex items-center gap-1.5">
              <AuthorAvatar name={author.name} />
              <span className="font-medium">{author.name}</span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-3">
            {timeStr && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {timeStr}
              </span>
            )}
            {view_count > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3"/></svg>
                {language === "ne" ? toNepaliDigits(view_count) : view_count}
              </span>
            )}
            {reading_time && reading_time > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                {language === "ne" ? `${toNepaliDigits(reading_time)} मिन` : `${reading_time} min`}
              </span>
            )}
            {comment_count > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                {language === "ne" ? toNepaliDigits(comment_count) : comment_count}
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
