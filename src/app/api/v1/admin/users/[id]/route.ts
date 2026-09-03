import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

interface DeleteUserProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: DeleteUserProps) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;
    if (id === session!.user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            articles: true,
            comments: true,
            comment_votes: true,
            media_files: true,
            audit_logs: true,
            page_views: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", is_active: true },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Cannot delete the last active admin" },
          { status: 400 }
        );
      }
    }

    const blockingRelations = [
      ["articles", user._count.articles],
      ["comments", user._count.comments],
      ["comment votes", user._count.comment_votes],
      ["media files", user._count.media_files],
      ["audit log entries", user._count.audit_logs],
      ["page views", user._count.page_views],
    ] as Array<[string, number]>;
    const blockingRelationsWithData = blockingRelations.filter(([, count]) => count > 0);

    if (blockingRelationsWithData.length > 0) {
      const details = blockingRelationsWithData
        .map(([label, count]) => `${count} ${label}`)
        .join(", ");
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Cannot delete this user because they have ${details}. Reassign or remove the related records first.`,
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id: user.id } });
    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "User",
      entityId: user.id,
      oldValue: { name: user.name, email: user.email, role: user.role },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { id: user.id },
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin user deletion error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Unable to delete user" },
      { status: 500 }
    );
  }
}
