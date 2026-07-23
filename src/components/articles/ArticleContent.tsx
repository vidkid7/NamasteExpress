"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { toNepaliDigits } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface ArticleContentProps {
  title: string;
  title_en?: string | null;
  content: string;
  content_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  ai_summary?: string | null;
  category: { name: string; name_en?: string | null; slug: string; color: string };
  author: { name?: string | null; image?: string | null };
  tags: { name: string; name_en?: string | null; slug: string }[];
  reading_time?: number | null;
  word_count?: number | null;
  view_count: number;
  published_at?: Date | string | null;
  slug: string;
}

export function ArticleContent({
  title,
  title_en,
  content,
  content_en,
  featured_image,
  ai_summary,
  category,
  author,
  tags,
  reading_time,
  word_count,
  view_count,
  published_at,
  slug,
}: ArticleContentProps) {
  const { language, t } = useLanguage();

  const displayTitle = language === "en" && title_en ? title_en : title;
  const displayContent = language === "en" && content_en ? content_en : content;
  const catName = language === "en" && category.name_en ? category.name_en : category.name;
  const views = language === "ne" ? toNepaliDigits(view_count) : view_count;

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString(
        language === "ne" ? "ne-NP" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : null;

  const readingTimeText = reading_time
    ? `${language === "ne" ? toNepaliDigits(reading_time) : reading_time} ${t("common.minutes")} ${t("common.readingTime")}`
    : null;

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}${publicArticlePath(slug)}`;

  return (
    <article>
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-accent">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${category.slug}`}
          className="hover:text-accent"
          style={{ fontFamily: "var(--font-nepali-serif)" }}
        >
          {catName}
        </Link>
      </nav>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-nepali-serif)" }}>
        {displayTitle}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-6">
        <span
          className="category-badge"
          style={{ "--category-color": category.color } as React.CSSProperties}
        >
          {catName}
        </span>
        {author.name && (
          <span className="flex items-center gap-1">
            {author.image && (
              <Image
                src={author.image}
                alt={author.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            {author.name}
          </span>
        )}
        {formattedDate && <span suppressHydrationWarning>{formattedDate}</span>}
        {readingTimeText && <span>{readingTimeText}</span>}
        <span>
          {views} {t("article.views")}
        </span>
        {word_count && (
          <span>
            {language === "ne" ? toNepaliDigits(word_count) : word_count}{" "}
            {t("article.wordCount")}
          </span>
        )}
      </div>

      {/* Featured image */}
      {featured_image && (
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={featured_image}
            alt={displayTitle}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      {/* AI Summary */}
      {ai_summary && (
        <div className="card p-4 mb-6 border-l-4 border-accent">
          <h2 className="text-sm font-bold text-accent mb-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
            {t("article.aiSummary")}
          </h2>
          <p className="text-sm text-muted leading-relaxed">{ai_summary}</p>
        </div>
      )}

      {/* Content */}
      <div
        className="prose-news mb-8"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="text-xs px-3 py-1 rounded-full border border-border hover:bg-surface transition-colors"
            >
              #{language === "en" && tag.name_en ? tag.name_en : tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Social share - mobile friendly */}
      <div className="flex flex-wrap items-center gap-2 border-t border-b border-border py-3 mb-6 sm:mb-8">
        <span className="text-sm font-medium w-full sm:w-auto">{t("common.share")}:</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary !py-2 !px-4 text-xs flex-1 sm:flex-none text-center"
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(displayTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary !py-2 !px-4 text-xs flex-1 sm:flex-none text-center"
        >
          X/Twitter
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          className="btn-secondary !py-2 !px-4 text-xs flex-1 sm:flex-none"
        >
          {t("common.copyLink")}
        </button>
      </div>

      {/* Comments placeholder */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-nepali-serif)" }}>{t("article.comments")}</h2>
        <div className="card p-6 text-center text-muted text-sm">
          {t("article.writeComment")}
        </div>
      </section>
    </article>
  );
}
