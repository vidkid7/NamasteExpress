"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchArticle {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  reading_time?: number | null;
  view_count: number;
  category: {
    id: string;
    name: string;
    name_en?: string | null;
    slug: string;
    color: string;
  };
  author: { id: string; name?: string | null; image?: string | null };
}

interface SearchResponse {
  success: boolean;
  data?: {
    data: SearchArticle[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6 pb-safe">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const query = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<SearchArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (q: string, p: number) => {
    if (!q || q.length < 2) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/search?q=${encodeURIComponent(q)}&page=${p}&pageSize=12`
      );
      const data: SearchResponse = await res.json();

      if (data.success && data.data) {
        setResults(data.data.data);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        setError(data.error || t("common.error"));
        setResults([]);
      }
    } catch {
      setError(t("common.error"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setInputValue(query);
    fetchResults(query, page);
  }, [query, page, fetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-safe">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-accent">
                {t("common.home")}
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground" style={{ fontFamily: "var(--font-nepali-serif)" }}>{t("common.search")}</li>
          </ol>
        </nav>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 max-w-2xl">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("common.search")}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            <button type="submit" className="btn-primary px-6">
              {t("common.search").replace("...", "")}
            </button>
          </div>
        </form>

        {/* Results info */}
        {query && !loading && (
          <p className="text-sm text-muted mb-6">
            {total > 0
              ? `"${query}" — ${total} results found`
              : error
                ? ""
                : t("common.noResults")}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-accent mb-6">{error}</p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                title_en={article.title_en}
                excerpt={article.excerpt}
                excerpt_en={article.excerpt_en}
                featured_image={article.featured_image}
                category={{
                  name: article.category.name,
                  name_en: article.category.name_en,
                  slug: article.category.slug,
                  color: article.category.color || "#c62828",
                }}
                author={article.author}
                reading_time={article.reading_time}
                published_at={article.published_at}
                view_count={article.view_count}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="btn-secondary text-sm"
              >
                <ArrowLeft className="inline h-3.5 w-3.5" /> {t("common.previous")}
              </Link>
            )}
            <span className="text-sm text-muted px-4">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="btn-secondary text-sm"
              >
                {t("common.next")} <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
