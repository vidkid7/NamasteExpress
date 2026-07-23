import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { holidaySchema } from "@/lib/validations";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const holidays = await prisma.holiday.findMany({ orderBy: [{ bs_year: "desc" }, { bs_month: "asc" }, { bs_day: "asc" }] });
  return NextResponse.json({ success: true, data: holidays });
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ success: false, error: "Invalid content type" }, { status: 415 });
  }

  try {
    const body = await req.json();
    const parsed = holidaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const holiday = await prisma.holiday.create({
      data: {
        title: parsed.data.title,
        title_en: parsed.data.title_en || null,
        bs_year: parsed.data.bs_year,
        bs_month: parsed.data.bs_month,
        bs_day: parsed.data.bs_day,
        ad_date: new Date(parsed.data.ad_date),
        type: parsed.data.type,
        is_public: parsed.data.is_public,
        description: parsed.data.description || null,
        description_en: parsed.data.description_en || null,
      },
    });
    return NextResponse.json({ success: true, data: holiday });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create holiday" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ success: false, error: "Invalid content type" }, { status: 415 });
  }

  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const parsed = holidaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        title: parsed.data.title,
        title_en: parsed.data.title_en || null,
        bs_year: parsed.data.bs_year,
        bs_month: parsed.data.bs_month,
        bs_day: parsed.data.bs_day,
        ad_date: new Date(parsed.data.ad_date),
        type: parsed.data.type,
        is_public: parsed.data.is_public,
        description: parsed.data.description || null,
        description_en: parsed.data.description_en || null,
      },
    });
    return NextResponse.json({ success: true, data: holiday });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update holiday" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  await prisma.holiday.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
