import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const { error } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const settings = await prisma.siteSettings.findMany();

    const settingsMap: Record<string, unknown> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: settingsMap }
    );
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "सेटिङहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अमान्य डाटा ढाँचा" },
        { status: 400 }
      );
    }

    const entries = Object.entries(body) as [string, unknown][];
    if (entries.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अपडेट गर्न कुनै सेटिङ प्रदान गरिएको छैन" },
        { status: 400 }
      );
    }

    // Fetch old values for audit
    const existingSettings = await prisma.siteSettings.findMany({
      where: { key: { in: entries.map(([key]) => key) } },
    });
    const oldValues: Record<string, unknown> = {};
    for (const s of existingSettings) {
      oldValues[s.key] = s.value;
    }

    // Upsert each setting
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object },
        })
      )
    );

    await auditLog({
      adminId: session!.user.id,
      action: "SETTINGS_CHANGE",
      entity: "SiteSettings",
      oldValue: oldValues as Record<string, unknown>,
      newValue: body as Record<string, unknown>,
    });

    // Return updated settings
    const updatedSettings = await prisma.siteSettings.findMany();
    const settingsMap: Record<string, unknown> = {};
    for (const setting of updatedSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: settingsMap }
    );
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "सेटिङहरू अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
