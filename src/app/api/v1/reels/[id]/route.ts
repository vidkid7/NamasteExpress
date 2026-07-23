import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { buildActiveContentByIdWhere } from "@/lib/public-articles";
import type { ApiResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reel = await prisma.reel.findUnique({ where: buildActiveContentByIdWhere(id) });

    if (!reel) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "रिल फेला परेन" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: reel });
  } catch (error) {
    console.error("Reel GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "रिल प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.reel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "रिल फेला परेन" },
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
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.video_url !== undefined) updateData.video_url = body.video_url;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const reel = await prisma.reel.update({
      where: { id },
      data: updateData,
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Reel",
      entityId: reel.id,
      oldValue: { title: existing.title, is_active: existing.is_active },
      newValue: { title: reel.title, is_active: reel.is_active },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: reel });
  } catch (error) {
    console.error("Reel PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "रिल अपडेट गर्दा त्रुटि भयो" },
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

    const existing = await prisma.reel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "रिल फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.reel.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "Reel",
      entityId: id,
      oldValue: { title: existing.title, slug: existing.slug },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Reel DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "रिल मेटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
