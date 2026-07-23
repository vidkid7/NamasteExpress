import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: "unauthorized" as const, session: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      emailVerified: true,
      is_active: true,
      session_version: true,
    },
  });

  if (!user?.is_active) {
    return { error: "unauthorized" as const, session: null };
  }

  if ((session.user.session_version ?? 0) !== user.session_version) {
    return { error: "unauthorized" as const, session: null };
  }

  session.user.role = user.role;
  session.user.email_verified = user.emailVerified;
  session.user.session_version = user.session_version;

  return { error: null, session };
}

export async function requireRole(roles: UserRole[]) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };
  if (!roles.includes(session!.user.role)) {
    return { error: "forbidden" as const, session: null };
  }
  return { error: null, session: session! };
}

export function unauthorizedResponse() {
  return NextResponse.json<ApiResponse>(
    { success: false, error: "प्रमाणीकरण आवश्यक छ" },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json<ApiResponse>(
    { success: false, error: "अनुमति छैन" },
    { status: 403 }
  );
}
