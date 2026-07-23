import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get article IDs with most page views in last 24 hours
    const trending = await prisma.pageView.groupBy({
      by: ["article_id"],
      where: {
        article_id: { not: null },
        created_at: { gte: twentyFourHoursAgo },
      },
      _count: { article_id: true },
      orderBy: { _count: { article_id: "desc" } },
      take: 5,
    });

    const articleIds = trending
      .map((t) => t.article_id)
      .filter((id): id is string => id !== null);

    if (articleIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: true, data: [] }
      );
    }

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        reading_time: true,
        view_count: true,
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
      },
    });

    // Preserve the trending order
    const viewCountMap = new Map(
      trending.map((t) => [t.article_id, t._count.article_id])
    );
    const sorted = articles.sort(
      (a, b) => (viewCountMap.get(b.id) || 0) - (viewCountMap.get(a.id) || 0)
    );

    return NextResponse.json<ApiResponse>(
      { success: true, data: sorted }
    );
  } catch (error) {
    console.error("Trending GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ट्रेन्डिङ लेखहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
