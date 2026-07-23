import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? "0") || undefined;
    const month = parseInt(searchParams.get("month") ?? "0") || undefined;
    const day = parseInt(searchParams.get("day") ?? "0") || undefined;

    const where: Record<string, unknown> = {};
    if (year) where.bs_year = year;
    if (month) where.bs_month = month;
    if (day) where.bs_day = day;

    const data = await prisma.panchangData.findMany({
      where,
      orderBy: [{ bs_year: "asc" }, { bs_month: "asc" }, { bs_day: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    }, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch panchang" }, { status: 500 });
  }
}
