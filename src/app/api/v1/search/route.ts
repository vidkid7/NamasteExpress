import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Article } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10")));
    const skip = (page - 1) * pageSize;

    if (!q || q.length < 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "खोज शब्द कम्तीमा २ अक्षरको हुनुपर्छ" },
        { status: 400 }
      );
    }

    const where = {
      status: "PUBLISHED" as const,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
        { excerpt: { contains: q, mode: "insensitive" as const } },
      ],
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { published_at: "desc" },
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
      }),
      prisma.article.count({ where }),
    ]);

    const result: PaginatedResponse<Article> = {
      data: articles as unknown as Article[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Article>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Search GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "खोजी गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
