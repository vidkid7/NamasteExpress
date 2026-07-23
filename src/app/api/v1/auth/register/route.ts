import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, normalizeEmail } from "@/lib/security";
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
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    const rateLimit = checkRateLimit(
      `register:${getClientIp(request)}`,
      5,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "धेरै अनुरोधहरू। कृपया पछि प्रयास गर्नुहोस्" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
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

    const { name, password } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

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
        role: "READER",
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: user.id, name: user.name, email: user.email },
        message: "दर्ता सफल भयो। कृपया आफ्नो इमेल प्रमाणित गर्नुहोस्।",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "दर्ता गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
