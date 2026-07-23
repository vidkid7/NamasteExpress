import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, normalizeEmail } from "@/lib/security";
import type { ApiResponse } from "@/types";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
  language: z.enum(["ne", "en"]).optional().default("ne"),
});

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    const rateLimit = checkRateLimit(
      `newsletter:${getClientIp(request)}`,
      8,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "धेरै अनुरोधहरू। कृपया पछि प्रयास गर्नुहोस्" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {
        language: parsed.data.language,
        source: "footer",
        is_active: true,
      },
      create: {
        email,
        language: parsed.data.language,
        source: "footer",
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: subscription.id,
          email: subscription.email,
          is_active: subscription.is_active,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to save newsletter subscription" },
      { status: 500 }
    );
  }
}
