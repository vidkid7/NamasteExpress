import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { sanitizeCommentHtml } from "@/lib/html";
import { buildPublishedArticleByIdWhere } from "@/lib/public-articles";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Comment } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const articleId = searchParams.get("article_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    if (!articleId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "article_id आवश्यक छ" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: buildPublishedArticleByIdWhere(articleId),
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    const where = {
      article_id: articleId,
      parent_id: null, // top-level comments only
      status: "APPROVED" as const,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          children: {
            where: { status: "APPROVED" },
            orderBy: { created_at: "asc" },
            include: {
              user: { select: { id: true, name: true, image: true } },
              children: {
                where: { status: "APPROVED" },
                orderBy: { created_at: "asc" },
                include: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const result: PaginatedResponse<Comment> = {
      data: comments as Comment[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Comment>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "टिप्पणीहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    if (!session!.user.email_verified) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "टिप्पणी गर्न इमेल प्रमाणित गर्नुपर्छ" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: buildPublishedArticleByIdWhere(parsed.data.article_id),
    });
    if (!article) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    if (parsed.data.parent_id) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parsed.data.parent_id },
      });
      if (!parentComment || parentComment.article_id !== parsed.data.article_id) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "अभिभावक टिप्पणी फेला परेन" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeCommentHtml(parsed.data.content),
        article_id: parsed.data.article_id,
        user_id: session!.user.id,
        parent_id: parsed.data.parent_id || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Increment comment count on the article
    await prisma.article.update({
      where: { id: parsed.data.article_id },
      data: { comment_count: { increment: 1 } },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "टिप्पणी सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
