import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
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

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING", "APPROVED", "REJECTED", "SPAM"].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const oldStatus = comment.status;
    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Comment",
      entityId: id,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch (error) {
    console.error("Comment PATCH error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
