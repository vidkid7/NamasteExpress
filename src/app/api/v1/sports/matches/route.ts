import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Match, MatchStatus } from "@prisma/client";

const VALID_STATUSES: MatchStatus[] = ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const tournamentId = searchParams.get("tournament_id");
    const status = searchParams.get("status");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (tournamentId) where.tournament_id = tournamentId;
    if (status && VALID_STATUSES.includes(status as MatchStatus)) {
      where.status = status;
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { match_date: "desc" },
        include: {
          tournament: { select: { id: true, name: true, slug: true, sport_type: true } },
          home_team: { select: { id: true, name: true, name_en: true, logo: true } },
          away_team: { select: { id: true, name: true, name_en: true, logo: true } },
        },
      }),
      prisma.match.count({ where }),
    ]);

    const result: PaginatedResponse<Match> = {
      data: matches as Match[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<Match>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Matches GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "खेलहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const { tournament_id, home_team_id, away_team_id, match_date, venue, status } = body;

    if (!tournament_id || !home_team_id || !away_team_id || !match_date) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "टुर्नामेन्ट, टोलीहरू र मिति आवश्यक छ" },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        tournament_id,
        home_team_id,
        away_team_id,
        match_date: new Date(match_date),
        venue: venue || null,
        status: status && VALID_STATUSES.includes(status) ? status : "UPCOMING",
      },
      include: {
        tournament: { select: { id: true, name: true, slug: true } },
        home_team: { select: { id: true, name: true, logo: true } },
        away_team: { select: { id: true, name: true, logo: true } },
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "Match",
      entityId: match.id,
      newValue: { tournament_id, home_team_id, away_team_id, match_date },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: match },
      { status: 201 }
    );
  } catch (error) {
    console.error("Match POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "खेल सिर्जना गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
