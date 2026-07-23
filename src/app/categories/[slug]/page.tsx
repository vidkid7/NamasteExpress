import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 12;

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug, is_active: true },
    select: {
      id: true,
      name: true,
      name_en: true,
      slug: true,
      description: true,
      color: true,
    },
  });
}

async function getCategoryArticles(
  categoryId: string,
  page: number
) {
  const skip = (page - 1) * PAGE_SIZE;
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { category_id: categoryId, status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        category: {
          select: { name: true, name_en: true, slug: true, color: true },
        },
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({
      where: { category_id: categoryId, status: "PUBLISHED" },
    }),
  ]);
  return { articles, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Not Found" };

  const title = category.name_en
    ? `${category.name} | ${category.name_en}`
    : `${category.name}`;
  const description =
    category.description ||
    `${category.name} सम्बन्धी ताजा समाचार, लेख र अपडेटहरू - नमस्ते एक्सप्रेस`;
  const url = canonicalUrl(`/categories/${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description,
      url,
      images: [defaultOpenGraphImage()],
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      images: [defaultOpenGraphImage()],
    },
  };
}

export default async function CategoryArchivePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));

  const category = await getCategory(slug);
  if (!category) notFound();

  const { articles, total, totalPages } = await getCategoryArticles(
    category.id,
    page
  );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 pb-safe">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-accent">
                गृहपृष्ठ
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground" style={{ fontFamily: "var(--font-nepali-serif)" }}>{category.name}</li>
          </ol>
        </nav>

        {/* Category header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>
            {category.name}
            {category.name_en && (
              <span className="text-lg text-muted ml-2 font-normal">
                ({category.name_en})
              </span>
            )}
          </h1>
          {category.description && (
            <p className="mt-2 text-muted">{category.description}</p>
          )}
          <p className="mt-1 text-sm text-muted">
            {total} {total === 1 ? "article" : "articles"}
          </p>
        </div>

        {/* Articles grid */}
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
          <p className="text-center text-muted py-12">
            कुनै लेख भेटिएन
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`/categories/${slug}?page=${page - 1}`}
                className="btn-secondary text-sm"
              >
                <ArrowLeft className="inline h-3.5 w-3.5" /> अघिल्लो
              </Link>
            )}
            <span className="text-sm text-muted px-4">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/categories/${slug}?page=${page + 1}`}
                className="btn-secondary text-sm"
              >
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
