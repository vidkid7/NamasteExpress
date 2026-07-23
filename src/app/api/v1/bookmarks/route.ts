import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { buildPublishedArticleByIdWhere } from "@/lib/public-articles";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Bookmark } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10")));
    const skip = (page - 1) * pageSize;

    const where = { user_id: session!.user.id, article: { status: "PUBLISHED" as const } };

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              featured_image: true,
              published_at: true,
              reading_time: true,
              category: { select: { id: true, name: true, slug: true } },
              author: { select: { id: true, name: true, image: true } },
            },
          },
        },
      }),
      prisma.bookmark.count({ where }),
    ]);

    const result: PaginatedResponse<Bookmark> = {
      data: bookmarks as Bookmark[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Bookmark>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "बुकमार्कहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const articleId = body.article_id;

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "article_id आवश्यक छ" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({ where: buildPublishedArticleByIdWhere(articleId) });
    if (!article) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        user_id_article_id: {
          user_id: session!.user.id,
          article_id: articleId,
        },
      },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "पहिले नै बुकमार्क गरिसकेको छ" },
        { status: 409 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        user_id: session!.user.id,
        article_id: articleId,
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: bookmark },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bookmark POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "बुकमार्क गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
