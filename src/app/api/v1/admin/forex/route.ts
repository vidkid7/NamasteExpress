import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { forexSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const rates = await prisma.forexRate.findMany({ orderBy: [{ date: "desc" }, { currency: "asc" }], take: 50 });
  return NextResponse.json({ success: true, data: rates });
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
    const parsed = forexSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const rate = await prisma.forexRate.create({
      data: {
        date: new Date(parsed.data.date),
        currency: parsed.data.currency.toUpperCase(),
        currency_name: parsed.data.currency_name || null,
        unit: parsed.data.unit,
        buy: parsed.data.buy || null,
        sell: parsed.data.sell || null,
      },
    });
    return NextResponse.json({ success: true, data: rate });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create forex rate" }, { status: 400 });
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

    const parsed = forexSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const rate = await prisma.forexRate.update({
      where: { id },
      data: {
        date: new Date(parsed.data.date),
        currency: parsed.data.currency.toUpperCase(),
        currency_name: parsed.data.currency_name || null,
        unit: parsed.data.unit,
        buy: parsed.data.buy || null,
        sell: parsed.data.sell || null,
      },
    });
    return NextResponse.json({ success: true, data: rate });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update forex rate" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  await prisma.forexRate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
