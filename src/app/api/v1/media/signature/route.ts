import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { hasCloudinaryConfig } from "@/lib/storage";
import type { ApiResponse } from "@/types";

export async function POST() {
  try {
    const { error } = await requireRole(["ADMIN", "EDITOR", "AUTHOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    if (!hasCloudinaryConfig()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Cloudinary storage is not configured" },
        { status: 503 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "namastexpress/images";
    const publicId = `${Date.now()}-${crypto.randomUUID()}`;
    const signedParams = { folder, public_id: publicId, timestamp };
    const signature = cloudinary.utils.api_sign_request(
      signedParams,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp,
        folder,
        public_id: publicId,
        signature,
      },
    });
  } catch (error) {
    console.error("Media signature error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "अपलोड हस्ताक्षर तयार गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
