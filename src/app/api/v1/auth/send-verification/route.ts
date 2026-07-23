import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import { sendEmail, verificationEmailTemplate } from "@/lib/email";
import { absoluteSiteUrl, checkRateLimit, getClientIp } from "@/lib/security";
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

    const rateLimit = checkRateLimit(
      `send-verification:${getClientIp(request)}`,
      3,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "धेरै अनुरोधहरू। कृपया पछि प्रयास गर्नुहोस्" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "प्रयोगकर्ता फेला परेन" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "इमेल पहिले नै प्रमाणित भइसकेको छ" },
        { status: 400 }
      );
    }

    // Invalidate existing tokens
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const token_hash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token_hash,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const verifyUrl = absoluteSiteUrl(request, `/api/v1/auth/verify-email?token=${token}`);
    const lang = (user.language as "ne" | "en") || "ne";

    await sendEmail({
      to: user.email,
      subject: lang === "ne" ? "इमेल प्रमाणीकरण" : "Email Verification",
      html: verificationEmailTemplate(user.name || "User", verifyUrl, lang),
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: lang === "ne"
        ? "प्रमाणीकरण इमेल पठाइयो"
        : "Verification email sent",
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "इमेल पठाउन सकिएन" },
      { status: 500 }
    );
  }
}
