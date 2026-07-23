import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "टोकन आवश्यक छ" },
        { status: 400 }
      );
    }

    const token_hash = crypto.createHash("sha256").update(token).digest("hex");

    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token_hash,
        used: false,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "अमान्य वा म्याद सकिएको टोकन" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/auth/login?verified=true", request.url)
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "प्रमाणीकरणमा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
