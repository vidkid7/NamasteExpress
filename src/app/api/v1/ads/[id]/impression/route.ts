import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contentType = _request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (!ad) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "विज्ञापन फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.advertisement.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id, impressions: ad.impressions + 1 } });
  } catch (error) {
    console.error("Ad impression error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "इम्प्रेसन रेकर्ड गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
