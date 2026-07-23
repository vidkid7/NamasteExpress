import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { buildPublishedArticleByIdWhere } from "@/lib/public-articles";
import { breakingNewsUpdateSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;
    const parsed = breakingNewsUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const item = await prisma.breakingNews.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const updateData: {
      title?: string;
      title_en?: string | null;
      article_id?: string | null;
      expires_at?: Date | null;
      is_active?: boolean;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.title_en !== undefined) updateData.title_en = body.title_en?.trim() || null;
    if (body.article_id !== undefined) {
      if (body.article_id) {
        const article = await prisma.article.findUnique({
          where: buildPublishedArticleByIdWhere(body.article_id),
          select: { id: true },
        });
        if (!article) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: "Breaking news can only link to published articles" },
            { status: 400 }
          );
        }
      }
      updateData.article_id = body.article_id || null;
    }
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at ? new Date(body.expires_at) : null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const updated = await prisma.breakingNews.update({
      where: { id },
      data: updateData,
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "BreakingNews",
      entityId: id,
      oldValue: { title: item.title, is_active: item.is_active },
      newValue: { title: updated.title, is_active: updated.is_active },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch (error) {
    console.error("BreakingNews PATCH error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update" },
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

    const item = await prisma.breakingNews.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    await prisma.breakingNews.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "BreakingNews",
      entityId: id,
      oldValue: { title: item.title },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("BreakingNews DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}
