import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "विज्ञापन फेला परेन" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.target_url !== undefined) updateData.target_url = body.target_url;
    if (body.position_id !== undefined) updateData.position_id = body.position_id;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.start_date !== undefined) updateData.start_date = body.start_date ? new Date(body.start_date) : null;
    if (body.end_date !== undefined) updateData.end_date = body.end_date ? new Date(body.end_date) : null;

    const ad = await prisma.advertisement.update({
      where: { id },
      data: updateData,
      include: {
        position: { select: { id: true, name: true, type: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Advertisement",
      entityId: ad.id,
      oldValue: { title: existing.title, is_active: existing.is_active },
      newValue: { title: ad.title, is_active: ad.is_active },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: ad });
  } catch (error) {
    console.error("Ad PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "विज्ञापन अपडेट गर्दा त्रुटि भयो" },
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

    const existing = await prisma.advertisement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "विज्ञापन फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.advertisement.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "Advertisement",
      entityId: id,
      oldValue: { title: existing.title },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Ad DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "विज्ञापन मेटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
