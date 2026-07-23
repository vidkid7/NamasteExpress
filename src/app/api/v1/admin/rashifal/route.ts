import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { rashifalSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const entries = await prisma.rashifal.findMany({ orderBy: [{ ad_date: "desc" }, { sign: "asc" }], take: 24 });
  return NextResponse.json({ success: true, data: entries });
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
    const parsed = rashifalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const entry = await prisma.rashifal.create({
      data: {
        sign: parsed.data.sign,
        sign_ne: parsed.data.sign_ne || null,
        bs_year: parsed.data.bs_year,
        bs_month: parsed.data.bs_month,
        bs_day: parsed.data.bs_day,
        ad_date: new Date(parsed.data.ad_date),
        prediction: parsed.data.prediction,
        prediction_en: parsed.data.prediction_en || null,
        rating: parsed.data.rating || null,
      },
    });
    return NextResponse.json({ success: true, data: entry });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create rashifal entry" }, { status: 400 });
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

    const parsed = rashifalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const entry = await prisma.rashifal.update({
      where: { id },
      data: {
        sign: parsed.data.sign,
        sign_ne: parsed.data.sign_ne || null,
        bs_year: parsed.data.bs_year,
        bs_month: parsed.data.bs_month,
        bs_day: parsed.data.bs_day,
        ad_date: new Date(parsed.data.ad_date),
        prediction: parsed.data.prediction,
        prediction_en: parsed.data.prediction_en || null,
        rating: parsed.data.rating || null,
      },
    });
    return NextResponse.json({ success: true, data: entry });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update rashifal entry" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  await prisma.rashifal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
