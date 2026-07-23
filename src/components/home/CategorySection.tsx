"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicArticlePath } from "@/lib/public-articles";
import { timeAgo } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface CategoryArticle {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  published_at?: string | Date | null;
  view_count: number;
  author: { name?: string | null };
  category: { name: string; name_en?: string | null; slug: string; color: string };
}

interface CategorySectionProps {
  sectionKey: string;
  articles: CategoryArticle[];
  color: string;
  slug: string;
  layout?: "grid" | "featured" | "list";
}

function PlaceholderImg() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-alt">
      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}

export function CategorySection({ sectionKey, articles, color, slug, layout = "featured" }: CategorySectionProps) {
  const { language } = useLanguage();
  if (!articles.length) return null;

  const title = (a: CategoryArticle) => (language === "en" && a.title_en ? a.title_en : a.title);
  const excerpt = (a: CategoryArticle) => (language === "en" && a.excerpt_en ? a.excerpt_en : a.excerpt);
  const catName = (a: CategoryArticle) => (language === "en" && a.category.name_en ? a.category.name_en : a.category.name);

  /* ── List layout ── */
  if (layout === "list") {
    return (
      <section>
        <SectionHeader titleKey={sectionKey} color={color} href={`/categories/${slug}`} />
        <div className="space-y-1">
          {articles.map((a) => (
            <Link key={a.id} href={publicArticlePath(a.slug)} className="side-article-item group">
              {/* Thumbnail */}
              <div className="relative w-24 h-[4.5rem] shrink-0 rounded-lg overflow-hidden bg-surface-alt thumb-zoom">
                {a.featured_image ? (
                  <ImageWithFallback src={a.featured_image} alt={title(a)} fill className="object-cover" sizes="96px" />
                ) : (
                  <PlaceholderImg />
                )}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color }}
                >
                  {catName(a)}
                </span>
                <h3
                  className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors mt-0.5"
                  style={{ lineHeight: "1.6", paddingTop: "0.05em" }}
                >
                  {title(a)}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {a.published_at ? timeAgo(new Date(a.published_at), language) : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  /* ── Grid layout ── */
  if (layout === "grid") {
    return (
      <section>
        <SectionHeader titleKey={sectionKey} color={color} href={`/categories/${slug}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={publicArticlePath(a.slug)}
              className="group block rounded-xl border border-border bg-surface overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border-strong"
            >
              {/* Image */}
              <div className="relative w-full aspect-[16/9] bg-surface-alt overflow-hidden thumb-zoom">
                {a.featured_image ? (
                  <ImageWithFallback
                    src={a.featured_image}
                    alt={title(a)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <PlaceholderImg />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {/* Content */}
              <div className="p-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color }}
                >
                  {catName(a)}
                </span>
                <h3
                  className="mt-1.5 text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors"
                  style={{ lineHeight: "1.6", paddingTop: "0.05em" }}
                >
                  {title(a)}
                </h3>
                <p className="text-xs text-muted mt-1.5">
                  {a.published_at ? timeAgo(new Date(a.published_at), language) : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  /* ── Featured layout: 1 big + smaller list ── */
  const [main, ...rest] = articles;
  return (
    <section>
      <SectionHeader titleKey={sectionKey} color={color} href={`/categories/${slug}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        {/* Main featured card */}
        <Link
          href={publicArticlePath(main.slug)}
          className="lg:col-span-3 group block relative rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ minHeight: "18rem" }}
        >
          {/* Image */}
          <div className="relative w-full min-h-[16rem] lg:min-h-[20rem] bg-surface-alt overflow-hidden thumb-zoom">
            {main.featured_image ? (
              <ImageWithFallback
                src={main.featured_image}
                alt={title(main)}
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            ) : (
              <PlaceholderImg />
            )}
          </div>

          {/* Overlay */}
          <div className="featured-card-overlay absolute inset-0" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <span
              className="inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
              style={{ backgroundColor: color }}
            >
              {catName(main)}
            </span>
            <h3
              className="mt-2 text-lg font-bold line-clamp-3 group-hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-nepali-serif)", lineHeight: "1.6", paddingTop: "0.1em" }}
            >
              {title(main)}
            </h3>
            {excerpt(main) && (
              <p className="mt-1.5 text-sm text-white/75 line-clamp-2">{excerpt(main)}</p>
            )}
            <div className="mt-2.5 flex items-center gap-3 text-xs text-white/55">
              {main.author.name && <span>{main.author.name}</span>}
              {main.published_at && <span>{timeAgo(new Date(main.published_at), language)}</span>}
            </div>
          </div>
        </Link>

        {/* Side list */}
        <div className="lg:col-span-2 space-y-1">
          {rest.map((a) => (
            <Link
              key={a.id}
              href={publicArticlePath(a.slug)}
              className="side-article-item group"
            >
              {/* Thumbnail */}
              <div className="relative w-[5.5rem] h-[4.25rem] shrink-0 rounded-lg overflow-hidden bg-surface-alt thumb-zoom">
                {a.featured_image ? (
                  <ImageWithFallback
                    src={a.featured_image}
                    alt={title(a)}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                ) : (
                  <PlaceholderImg />
                )}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0 py-0.5">
                <h4
                  className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors"
                  style={{ lineHeight: "1.6", paddingTop: "0.05em" }}
                >
                  {title(a)}
                </h4>
                <p className="text-xs text-muted mt-1">
                  {a.published_at ? timeAgo(new Date(a.published_at), language) : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
