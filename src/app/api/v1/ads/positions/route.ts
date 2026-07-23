import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";
import type { AdPositionType } from "@prisma/client";

const VALID_TYPES: AdPositionType[] = ["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "BETWEEN_SECTIONS", "POPUP"];

export async function GET() {
  try {
    const positions = await prisma.adPosition.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json<ApiResponse>({ success: true, data: positions });
  } catch (error) {
    console.error("Ad positions GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch ad positions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole(["ADMIN"]);
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
    const { name, type, width, height } = body;

    if (!name || !type) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type as AdPositionType)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const position = await prisma.adPosition.create({
      data: {
        name,
        type: type as AdPositionType,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
      },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: position },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Ad position POST error:", error);
    const isUniqueViolation = error instanceof Error && "code" in error && (error as { code: string }).code === "P2002";
    return NextResponse.json<ApiResponse>(
      { success: false, error: isUniqueViolation ? "Position name already exists" : "Failed to create position" },
      { status: isUniqueViolation ? 409 : 500 }
    );
  }
}
