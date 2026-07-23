import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

// Public endpoint — returns only non-sensitive site settings
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany();

    const settingsMap: Record<string, unknown> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: settingsMap },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "सेटिङहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
