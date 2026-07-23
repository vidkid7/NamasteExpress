import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";
import { tagSlug } from "@/lib/tag-slug";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole(["ADMIN", "EDITOR"]);
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
    const { name, name_en } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ट्याग नाम आवश्यक छ" },
        { status: 400 }
      );
    }

    const slug = tagSlug(name, name_en);
    if (!slug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अमान्य ट्याग नाम" },
        { status: 400 }
      );
    }

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो ट्याग पहिले नै अवस्थित छ" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim(), name_en: name_en?.trim() || null, slug },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: tag }, { status: 201 });
  } catch (error) {
    console.error("Admin tags POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ट्याग सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireRole(["ADMIN", "EDITOR"]);
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
    const { id, name, name_en } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ट्याग ID आवश्यक छ" },
        { status: 400 }
      );
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ट्याग नाम आवश्यक छ" },
        { status: 400 }
      );
    }

    const slug = tagSlug(name, name_en);
    if (!slug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अमान्य ट्याग नाम" },
        { status: 400 }
      );
    }

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ट्याग फेला परेन" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.tag.findFirst({ where: { slug, NOT: { id } } });
    if (duplicate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो ट्याग पहिले नै अवस्थित छ" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: name.trim(), name_en: name_en?.trim() || null, slug },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: tag });
  } catch (error) {
    console.error("Admin tags PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ट्याग अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireRole(["ADMIN", "EDITOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "ट्याग ID आवश्यक छ" },
        { status: 400 }
      );
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json<ApiResponse>({ success: true, data: null });
  } catch (error) {
    console.error("Admin tags DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "ट्याग मेट्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
