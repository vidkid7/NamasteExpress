import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { goldSilverSchema } from "@/lib/validations";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "EDITOR"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const prices = await prisma.goldSilverPrice.findMany({ orderBy: { date: "desc" }, take: 30 });
  return NextResponse.json({ success: true, data: prices });
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
    const parsed = goldSilverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const price = await prisma.goldSilverPrice.create({
      data: {
        date: new Date(parsed.data.date),
        fine_gold: parsed.data.fine_gold || null,
        tejabi_gold: parsed.data.tejabi_gold || null,
        silver: parsed.data.silver || null,
        source: parsed.data.source || null,
      },
    });
    return NextResponse.json({ success: true, data: price });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create price entry" }, { status: 400 });
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

    const parsed = goldSilverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const price = await prisma.goldSilverPrice.update({
      where: { id },
      data: {
        date: new Date(parsed.data.date),
        fine_gold: parsed.data.fine_gold || null,
        tejabi_gold: parsed.data.tejabi_gold || null,
        silver: parsed.data.silver || null,
        source: parsed.data.source || null,
      },
    });
    return NextResponse.json({ success: true, data: price });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update price entry" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole(["ADMIN"]);
  if (error === "unauthorized") return unauthorizedResponse();
  if (error === "forbidden") return forbiddenResponse();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  await prisma.goldSilverPrice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
