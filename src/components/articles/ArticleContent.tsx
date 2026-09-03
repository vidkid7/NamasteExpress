"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toNepaliDigits } from "@/contexts/LanguageContext";
import { shortArticlePath } from "@/lib/public-articles";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { articleContentToDisplayHtml } from "@/lib/article-content";

function FacebookShareIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  );
}

function XShareIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933ZM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404Z" />
    </svg>
  );
}

function CopyLinkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

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
  articleId: string;
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
  articleId,
}: ArticleContentProps) {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

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
      ? new URL(shortArticlePath(articleId), window.location.origin).toString()
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}${shortArticlePath(articleId)}`;

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article>
      {/* Breadcrumbs */}
      <nav className="mb-4 flex min-w-0 flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-accent">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${category.slug}`}
          className="min-w-0 max-w-full break-words hover:text-accent"
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
        dangerouslySetInnerHTML={{ __html: articleContentToDisplayHtml(displayContent) }}
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
          aria-label="Share on Facebook"
          className="btn-secondary !py-2 !px-2 sm:!px-4 text-xs flex-1 min-w-0 text-center text-[#1877f2]"
        >
          <FacebookShareIcon />
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(displayTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X/Twitter"
          className="btn-secondary !py-2 !px-2 sm:!px-4 text-xs flex-1 min-w-0 text-center"
        >
          <XShareIcon />
          X/Twitter
        </a>
        <button
          onClick={copyArticleLink}
          aria-label={copied ? (language === "ne" ? "लिंक कपी भयो" : "Link copied") : t("common.copyLink")}
          className="btn-secondary !py-2 !px-2 sm:!px-4 text-xs flex-1 min-w-0"
        >
          <CopyLinkIcon />
          {copied ? (language === "ne" ? "कपी भयो" : "Copied") : t("common.copyLink")}
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
