import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";
import { matchUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "खेल फेला परेन" },
        { status: 404 }
      );
    }

    const parsed = matchUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { match_date, ...fields } = parsed.data;
    const updateData: Record<string, unknown> = {
      ...fields,
      ...(match_date ? { match_date: new Date(match_date) } : {}),
    };

    const match = await prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        tournament: { select: { id: true, name: true, slug: true } },
        home_team: { select: { id: true, name: true, logo: true } },
        away_team: { select: { id: true, name: true, logo: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "Match",
      entityId: match.id,
      oldValue: { home_score: existing.home_score, away_score: existing.away_score, status: existing.status },
      newValue: { home_score: match.home_score, away_score: match.away_score, status: match.status },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: match });
  } catch (error) {
    console.error("Match PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "खेल अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();
    const { id } = await params;
    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) return NextResponse.json<ApiResponse>({ success: false, error: "खेल फेला परेन" }, { status: 404 });
    await prisma.match.delete({ where: { id } });
    await auditLog({ adminId: session!.user.id, action: "DELETE", entity: "Match", entityId: id, oldValue: { tournament_id: existing.tournament_id } });
    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Match DELETE error:", error);
    return NextResponse.json<ApiResponse>({ success: false, error: "खेल मेट्दा त्रुटि भयो" }, { status: 500 });
  }
}
