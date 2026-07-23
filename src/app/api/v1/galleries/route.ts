import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { buildActiveContentListWhere } from "@/lib/public-articles";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Gallery } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const includeInactive = searchParams.get("includeInactive") === "true";
    const skip = (page - 1) * pageSize;

    let canManage = false;
    if (includeInactive) {
      const roleCheck = await requireRole(["ADMIN"]);
      canManage = !roleCheck.error;
    }

    const where = buildActiveContentListWhere({ includeInactive, canManage });

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: {
          _count: { select: { images: true } },
        },
      }),
      prisma.gallery.count({ where }),
    ]);

    const result: PaginatedResponse<Gallery> = {
      data: galleries as Gallery[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Gallery>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Galleries GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ग्यालेरीहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { title, title_en, slug, description, cover_image, images } = body;

    if (!title || !slug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "शीर्षक र स्लग आवश्यक छ" },
        { status: 400 }
      );
    }

    const existing = await prisma.gallery.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" },
        { status: 409 }
      );
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        title_en: title_en || null,
        slug,
        description: description || null,
        cover_image: cover_image || null,
        images: images?.length
          ? {
              create: images.map((img: { url: string; caption?: string; caption_en?: string; sort_order?: number }, i: number) => ({
                url: img.url,
                caption: img.caption || null,
                caption_en: img.caption_en || null,
                sort_order: img.sort_order ?? i,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sort_order: "asc" } },
        _count: { select: { images: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Gallery",
      entityId: gallery.id,
      newValue: { title: gallery.title, slug: gallery.slug },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: gallery },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gallery POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ग्यालेरी सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
