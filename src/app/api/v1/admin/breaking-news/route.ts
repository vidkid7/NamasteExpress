import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { buildPublishedArticleByIdWhere } from "@/lib/public-articles";
import { breakingNewsCreateSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const parsed = breakingNewsCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { title, title_en, article_id, expires_at } = parsed.data;

    if (article_id) {
      const article = await prisma.article.findUnique({
        where: buildPublishedArticleByIdWhere(article_id),
        select: { id: true },
      });
      if (!article) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Breaking news can only link to published articles" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.breakingNews.create({
      data: {
        title,
        title_en: title_en || null,
        article_id: article_id || null,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: true,
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "BreakingNews",
      entityId: item.id,
      newValue: { title },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: item },
      { status: 201 }
    );
  } catch (error) {
    console.error("BreakingNews POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create breaking news" },
      { status: 500 }
    );
  }
}
