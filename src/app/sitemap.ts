import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { publicArticlePath } from "@/lib/public-articles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/finance`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/sports`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/patro`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/rashifal`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/share-market`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/galleries`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/reels`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];

  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updated_at: true },
      orderBy: { published_at: "desc" },
      take: 5000,
    });
    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${BASE_URL}${publicArticlePath(a.slug)}`,
      lastModified: a.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const categories = await prisma.category.findMany({
      where: { is_active: true },
      select: { slug: true, updated_at: true },
    });
    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE_URL}/categories/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...articlePages, ...categoryPages];
  } catch (error) {
    console.error("Sitemap database lookup failed:", error);
    return staticPages;
  }
}
