import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { buildActiveContentListWhere } from "@/lib/public-articles";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Reel } from "@prisma/client";

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

    const [reels, total] = await Promise.all([
      prisma.reel.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
      }),
      prisma.reel.count({ where }),
    ]);

    const result: PaginatedResponse<Reel> = {
      data: reels,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Reel>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Reels GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "रिलहरू प्राप्त गर्दा त्रुटि भयो" },
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
    const { title, title_en, slug, video_url, thumbnail, description } = body;

    if (!title || !slug || !video_url) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "शीर्षक, स्लग र भिडियो URL आवश्यक छ" },
        { status: 400 }
      );
    }

    const existing = await prisma.reel.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" },
        { status: 409 }
      );
    }

    const reel = await prisma.reel.create({
      data: {
        title,
        title_en: title_en || null,
        slug,
        video_url,
        thumbnail: thumbnail || null,
        description: description || null,
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Reel",
      entityId: reel.id,
      newValue: { title: reel.title, slug: reel.slug },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: reel },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reel POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "रिल सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
