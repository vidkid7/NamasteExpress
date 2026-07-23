import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";
import type { AdPositionType, Prisma } from "@prisma/client";

const VALID_POSITIONS: AdPositionType[] = ["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "BETWEEN_SECTIONS", "POPUP"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const position = searchParams.get("position");

    const now = new Date();

    const where: Prisma.AdvertisementWhereInput = {
      is_active: true,
      AND: [
        {
          OR: [
            { start_date: null },
            { start_date: { lte: now } },
          ],
        },
        {
          OR: [
            { end_date: null },
            { end_date: { gte: now } },
          ],
        },
      ],
    };

    if (position && VALID_POSITIONS.includes(position as AdPositionType)) {
      where.position = { type: position as AdPositionType };
    }

    const ads = await prisma.advertisement.findMany({
      where,
      include: {
        position: { select: { id: true, name: true, type: true, width: true, height: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: ads });
  } catch (error) {
    console.error("Ads GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "विज्ञापनहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { title, image_url, target_url, position_id, start_date, end_date } = body;

    if (!title || !target_url || !position_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "शीर्षक, लक्ष्य URL र स्थिति आवश्यक छ" },
        { status: 400 }
      );
    }

    const positionExists = await prisma.adPosition.findUnique({ where: { id: position_id } });
    if (!positionExists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "विज्ञापन स्थिति फेला परेन" },
        { status: 404 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        title,
        image_url: image_url || null,
        target_url,
        position_id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
      include: {
        position: { select: { id: true, name: true, type: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Advertisement",
      entityId: ad.id,
      newValue: { title: ad.title, position_id: ad.position_id },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: ad },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ad POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "विज्ञापन सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
