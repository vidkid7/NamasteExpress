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

    const gallery = await prisma.gallery.findUnique({
      where: buildActiveContentByIdWhere(id),
      include: {
        images: { orderBy: { sort_order: "asc" } },
        _count: { select: { images: true } },
      },
    });

    if (!gallery) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ग्यालेरी फेला परेन" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: gallery });
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ग्यालेरी प्राप्त गर्दा त्रुटि भयो" },
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

    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ग्यालेरी फेला परेन" },
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
    if (body.description !== undefined) updateData.description = body.description;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (body.images !== undefined) {
      await prisma.galleryImage.deleteMany({ where: { gallery_id: id } });
      if (body.images.length > 0) {
        await prisma.galleryImage.createMany({
          data: body.images.map((img: { url: string; caption?: string; caption_en?: string; sort_order?: number }, i: number) => ({
            gallery_id: id,
            url: img.url,
            caption: img.caption || null,
            caption_en: img.caption_en || null,
            sort_order: img.sort_order ?? i,
          })),
        });
      }
    }

    const gallery = await prisma.gallery.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sort_order: "asc" } },
        _count: { select: { images: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Gallery",
      entityId: gallery.id,
      oldValue: { title: existing.title, is_active: existing.is_active },
      newValue: { title: gallery.title, is_active: gallery.is_active },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: gallery });
  } catch (error) {
    console.error("Gallery PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ग्यालेरी अपडेट गर्दा त्रुटि भयो" },
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

    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ग्यालेरी फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.gallery.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "Gallery",
      entityId: id,
      oldValue: { title: existing.title, slug: existing.slug },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ग्यालेरी मेटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
