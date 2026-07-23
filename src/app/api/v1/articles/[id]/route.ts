import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleSchema } from "@/lib/validations";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { sanitizeArticleHtml } from "@/lib/html";
import {
  buildArticleVisibilityUpdateData,
  buildPublishedArticleByIdWhere,
} from "@/lib/public-articles";
import { cacheDel } from "@/lib/redis";
import type { ApiResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: buildPublishedArticleByIdWhere(id),
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (!article) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: article });
  } catch (error) {
    console.error("Article GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "लेख प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["AUTHOR", "EDITOR", "ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    // Authors can only edit their own articles
    if (session!.user.role === "AUTHOR" && existing.author_id !== session!.user.id) {
      return forbiddenResponse();
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const parsed = articleSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { tag_ids, ...updateData } = parsed.data;

    // Sanitize HTML content to prevent XSS
    if (updateData.content) {
      updateData.content = sanitizeArticleHtml(updateData.content);
    }
    if (updateData.content_en) {
      updateData.content_en = sanitizeArticleHtml(updateData.content_en);
    }

    if (updateData.content) {
      const wordCount = updateData.content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/)
        .filter(Boolean).length;
      (updateData as Record<string, unknown>).word_count = wordCount;
      (updateData as Record<string, unknown>).reading_time = Math.ceil(wordCount / 200);
    }

    const articleUpdateData = buildArticleVisibilityUpdateData(
      existing.status,
      updateData
    );

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...articleUpdateData,
        ...(tag_ids !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tag_ids.map((tagId: string) => ({ tag_id: tagId })),
              },
            }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (article.status !== "PUBLISHED") {
      await prisma.breakingNews.updateMany({
        where: { article_id: article.id, is_active: true },
        data: { is_active: false },
      });
    }

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Article",
      entityId: article.id,
      oldValue: { title: existing.title, status: existing.status },
      newValue: { title: article.title, status: article.status },
    });

    await cacheDel("home:featured");
    await cacheDel("home:trending");

    return NextResponse.json<ApiResponse>({ success: true, data: article });
  } catch (error) {
    console.error("Article PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "लेख अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.article.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "Article",
      entityId: id,
      oldValue: { title: existing.title, slug: existing.slug },
    });

    await cacheDel("home:featured");
    await cacheDel("home:trending");

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Article DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "लेख मेटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
