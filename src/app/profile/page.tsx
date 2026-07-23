"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookmarkArticle {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  excerpt?: string | null;
  excerpt_en?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  reading_time?: number | null;
  category: {
    id: string;
    name: string;
    name_en?: string | null;
    slug: string;
    color: string;
  };
  author: { id: string; name?: string | null };
}

interface BookmarkItem {
  id: string;
  article_id: string;
  article: BookmarkArticle;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/bookmarks?pageSize=50");
      const data = await res.json();
      if (data.success && data.data) {
        setBookmarks(data.data.data);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status, router, fetchBookmarks]);

  const removeBookmark = async (articleId: string) => {
    setRemovingId(articleId);
    try {
      const res = await fetch(`/api/v1/bookmarks/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookmarks((prev) =>
          prev.filter((b) => b.article_id !== articleId)
        );
      }
    } catch {
      // Fail silently
    } finally {
      setRemovingId(null);
    }
  };

  if (status === "loading") {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-32 w-full max-w-md" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!session?.user) return null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-accent">
                {t("common.home")}
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground">
              {t("common.profile")}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User info & preferences */}
          <aside className="lg:col-span-1">
            <div className="card p-6 space-y-6">
              {/* Avatar & name */}
              <div className="flex flex-col items-center text-center">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ""}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold">
                    {(session.user.name || session.user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <h2 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                  {session.user.name || t("common.profile")}
                </h2>
                <p className="text-sm text-muted">{session.user.email}</p>
              </div>

              {/* Preferences */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  {t("common.settings")}
                </h3>

                {/* Theme toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("common.theme")}</span>
                  <button
                    onClick={toggleTheme}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    {theme === "light"
                      ? t("common.darkMode")
                      : t("common.lightMode")}
                  </button>
                </div>

                {/* Language toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t("common.language")}</span>
                  <button
                    onClick={() =>
                      setLanguage(language === "ne" ? "en" : "ne")
                    }
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    {language === "ne" ? "English" : "नेपाली"}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content - Bookmarks */}
          <section className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              {t("common.bookmarks")}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-10 w-10 mx-auto mb-3" />
                <p className="text-muted">{t("common.noResults")}</p>
                <Link href="/" className="btn-primary mt-4 inline-block">
                  {t("common.home")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="relative group/bm">
                    <ArticleCard
                      slug={bookmark.article.slug}
                      title={bookmark.article.title}
                      title_en={bookmark.article.title_en}
                      excerpt={bookmark.article.excerpt}
                      excerpt_en={bookmark.article.excerpt_en}
                      featured_image={bookmark.article.featured_image}
                      category={{
                        name: bookmark.article.category.name,
                        name_en: bookmark.article.category.name_en,
                        slug: bookmark.article.category.slug,
                        color:
                          bookmark.article.category.color || "#c62828",
                      }}
                      author={bookmark.article.author}
                      reading_time={bookmark.article.reading_time}
                      published_at={bookmark.article.published_at}
                    />
                    <button
                      onClick={() =>
                        removeBookmark(bookmark.article_id)
                      }
                      disabled={removingId === bookmark.article_id}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-2 opacity-0 group-hover/bm:opacity-100 transition-opacity hover:bg-accent hover:text-white"
                      aria-label={t("common.delete")}
                    >
                      {removingId === bookmark.article_id ? (
                        <span className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
