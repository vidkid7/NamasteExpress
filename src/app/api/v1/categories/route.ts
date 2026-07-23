import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
      include: {
        _count: { select: { articles: true } },
        children: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
          include: { _count: { select: { articles: true } } },
        },
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "वर्गहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: parsed.data,
      include: { _count: { select: { articles: true } } },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      newValue: { name: category.name, slug: category.slug },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "वर्ग सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "वर्ग ID आवश्यक छ" },
        { status: 400 }
      );
    }

    const parsed = categorySchema.safeParse({
      name: body.name,
      name_en: body.name_en,
      slug: body.slug,
      description: body.description,
      color: body.color,
      sort_order: Number(body.sort_order ?? 0),
      parent_id: body.parent_id ?? null,
    });

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "वर्ग फेला परेन" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो स्लग पहिले नै प्रयोग भइसकेको छ" },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...parsed.data,
        is_active: typeof body.is_active === "boolean" ? body.is_active : existing.is_active,
      },
      include: { _count: { select: { articles: true } } },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Category",
      entityId: category.id,
      oldValue: { name: existing.name, slug: existing.slug, is_active: existing.is_active },
      newValue: { name: category.name, slug: category.slug, is_active: category.is_active },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: category });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "वर्ग अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "वर्ग ID आवश्यक छ" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { articles: true, children: true } } },
    });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "वर्ग फेला परेन" },
        { status: 404 }
      );
    }
    if (existing._count.articles > 0 || existing._count.children > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "लेख वा उप-वर्ग भएको वर्ग मेट्न सकिँदैन" },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "Category",
      entityId: id,
      oldValue: { name: existing.name, slug: existing.slug },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "वर्ग मेट्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
