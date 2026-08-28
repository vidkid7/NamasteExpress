import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";
import { buildPublicArticleWhere } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

async function getPublishedArticles(page: number) {
  const where = buildPublicArticleWhere({});
  const total = await prisma.article.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const articles = await prisma.article.findMany({
    where,
    orderBy: { published_at: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      category: {
        select: { name: true, name_en: true, slug: true, color: true },
      },
      author: { select: { name: true } },
    },
  });

  return { articles, total, totalPages, currentPage };
}

export function generateMetadata(): Metadata {
  const title = "सबै लेखहरू | All Articles";
  const description = "नमस्ते एक्सप्रेसका सबै प्रकाशित समाचार, लेख र अपडेटहरू।";
  const url = canonicalUrl("/articles");

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: [defaultOpenGraphImage()] },
    twitter: { card: "summary_large_image", title, description, images: [defaultOpenGraphImage()] },
  };
}

export default async function ArticlesArchivePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const { articles, total, totalPages, currentPage } = await getPublishedArticles(page);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-safe">
        <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="hover:text-accent">गृहपृष्ठ</Link></li>
            <li>/</li>
            <li className="font-medium text-foreground" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              सबै लेखहरू
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>
            सबै लेखहरू <span className="text-lg text-muted ml-2 font-normal">(All Articles)</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{total} प्रकाशित लेखहरू</p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                slug={article.slug}
                title={article.title}
                title_en={article.title_en}
                excerpt={article.excerpt}
                excerpt_en={article.excerpt_en}
                featured_image={article.featured_image}
                category={article.category}
                author={article.author}
                reading_time={article.reading_time}
                published_at={article.published_at}
                view_count={article.view_count}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-12">कुनै प्रकाशित लेख भेटिएन</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {currentPage > 1 && (
              <Link href={`/articles?page=${currentPage - 1}`} className="btn-secondary text-sm">
                <ArrowLeft className="inline h-3.5 w-3.5" /> अघिल्लो
              </Link>
            )}
            <span className="text-sm text-muted px-4">{currentPage} / {totalPages}</span>
            {currentPage < totalPages && (
              <Link href={`/articles?page=${currentPage + 1}`} className="btn-secondary text-sm">
                अर्को <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
