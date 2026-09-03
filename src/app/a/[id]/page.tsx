import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import {
  publicArticlePath,
  buildPublishedArticleByIdWhere,
  decodePublicSlugParam,
} from "@/lib/public-articles";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ShortArticlePageProps {
  params: Promise<{ id: string }>;
}

async function getShortArticle(id: string) {
  return prisma.article.findUnique({
    where: buildPublishedArticleByIdWhere(decodePublicSlugParam(id)),
    select: {
      title: true,
      excerpt: true,
      featured_image: true,
      slug: true,
    },
  });
}

export async function generateMetadata({ params }: ShortArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getShortArticle(id);
  if (!article) return { title: "Not Found" };

  const url = canonicalUrl(publicArticlePath(article.slug));
  const images = article.featured_image ? [article.featured_image] : [defaultOpenGraphImage()];

  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt || undefined,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images,
    },
  };
}

export default async function ShortArticlePage({ params }: ShortArticlePageProps) {
  const { id } = await params;
  const article = await getShortArticle(id);

  if (!article) notFound();
  redirect(publicArticlePath(article.slug));
}
