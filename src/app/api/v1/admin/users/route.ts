import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { registerSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit";
import type { ApiResponse } from "@/types";

const roles: UserRole[] = ["READER", "AUTHOR", "EDITOR", "ADMIN"];

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
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const role = body.role || "READER";
    if (!roles.includes(role as UserRole)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो इमेल ठेगाना पहिले नै दर्ता भइसकेको छ" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: role as UserRole,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newValue: { name: user.name, email: user.email, role: user.role },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो इमेल ठेगाना पहिले नै दर्ता भइसकेको छ" },
        { status: 409 }
      );
    }
    console.error("Admin user creation error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
