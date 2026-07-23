import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: tags });
  } catch (error) {
    console.error("Tags GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
