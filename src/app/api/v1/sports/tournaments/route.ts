import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (active === "true") where.is_active = true;
    if (active === "false") where.is_active = false;

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { matches: true } },
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: tournaments });
  } catch (error) {
    console.error("Tournaments GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "टुर्नामेन्टहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const { name, name_en, slug, sport_type, start_date, end_date } = body;

    if (!name || !slug || !sport_type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "नाम, स्लग र खेल प्रकार आवश्यक छ" },
        { status: 400 }
      );
    }

    const existing = await prisma.tournament.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" },
        { status: 409 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        name_en: name_en || null,
        slug,
        sport_type,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Tournament",
      entityId: tournament.id,
      newValue: { name: tournament.name, slug: tournament.slug },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: tournament },
      { status: 201 }
    );
  } catch (error) {
    console.error("Tournament POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "टुर्नामेन्ट सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id, name, name_en, slug, sport_type, start_date, end_date, is_active } = await request.json();
    if (!id || !name || !slug || !sport_type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "आईडी, नाम, स्लग र खेल प्रकार आवश्यक छ" },
        { status: 400 }
      );
    }

    const existing = await prisma.tournament.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: "टुर्नामेन्ट फेला परेन" }, { status: 404 });
    }
    const duplicate = await prisma.tournament.findFirst({ where: { slug, NOT: { id } } });
    if (duplicate) {
      return NextResponse.json<ApiResponse>({ success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" }, { status: 409 });
    }

    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        name,
        name_en: name_en || null,
        slug,
        sport_type,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        ...(typeof is_active === "boolean" ? { is_active } : {}),
      },
      include: { _count: { select: { matches: true } } },
    });
    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Tournament",
      entityId: id,
      oldValue: { name: existing.name, slug: existing.slug, sport_type: existing.sport_type },
      newValue: { name: tournament.name, slug: tournament.slug, sport_type: tournament.sport_type },
    });
    return NextResponse.json<ApiResponse>({ success: true, data: tournament });
  } catch (error) {
    console.error("Tournament PUT error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "टुर्नामेन्ट अपडेट गर्दा त्रुटि भयो" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json<ApiResponse>({ success: false, error: "टुर्नामेन्ट आईडी आवश्यक छ" }, { status: 400 });

    const existing = await prisma.tournament.findUnique({ where: { id }, include: { _count: { select: { matches: true } } } });
    if (!existing) return NextResponse.json<ApiResponse>({ success: false, error: "टुर्नामेन्ट फेला परेन" }, { status: 404 });
    if (existing._count.matches > 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: "खेलहरू भएका टुर्नामेन्ट मेट्न सकिँदैन" }, { status: 409 });
    }
    await prisma.tournament.delete({ where: { id } });
    await auditLog({ adminId: session!.user.id, action: "DELETE", entity: "Tournament", entityId: id, oldValue: { name: existing.name, slug: existing.slug } });
    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Tournament DELETE error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "टुर्नामेन्ट मेट्दा त्रुटि भयो" }, { status: 500 });
  }
}
