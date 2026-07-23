import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordResetSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/security";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    const rateLimit = checkRateLimit(
      `reset-password:${getClientIp(request)}`,
      10,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "धेरै अनुरोधहरू। कृपया पछि प्रयास गर्नुहोस्" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const body = await request.json();
    const parsed = passwordResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password, token } = parsed.data;
    const token_hash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token_hash,
        used: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अमान्य वा म्याद सकिएको टोकन" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          password_hash,
          failed_login_count: 0,
          locked_until: null,
          last_failed_login_at: null,
          session_version: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidate all sessions for this user
      prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "पासवर्ड सफलतापूर्वक रिसेट भयो। कृपया लगइन गर्नुहोस्।",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "पासवर्ड रिसेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
