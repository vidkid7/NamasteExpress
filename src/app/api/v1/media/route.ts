import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { getStorageProvider } from "@/lib/storage";
import { isPrivateHostname } from "@/lib/security";
import {
  extensionForMimeType,
  hasValidFileSignature,
  sanitizeOriginalFilename,
} from "@/lib/upload-validation";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { MediaFile } from "@prisma/client";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(["ADMIN", "EDITOR", "AUTHOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const search = searchParams.get("search");
    const mimeType = searchParams.get("mime_type");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { original_name: { contains: search, mode: "insensitive" } },
        { alt_text: { contains: search, mode: "insensitive" } },
      ];
    }
    if (mimeType) {
      where.mime_type = { startsWith: mimeType };
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: {
          uploader: { select: { id: true, name: true } },
        },
      }),
      prisma.mediaFile.count({ where }),
    ]);

    const result: PaginatedResponse<MediaFile> = {
      data: files as MediaFile[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<MediaFile>>>(
      { success: true, data: result }
    );
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "मिडिया फाइलहरू प्राप्त गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR", "AUTHOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payload too large" },
        { status: 413 }
      );
    }

    // ── URL-based registration ──────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await request.json() as { url?: string; alt_text?: string };
      const rawUrl: string = (body.url ?? "").trim();
      if (!rawUrl) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "URL आवश्यक छ" },
          { status: 400 }
        );
      }
      // Validate it is an absolute URL
      try { new URL(rawUrl); } catch {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "अमान्य URL" },
          { status: 400 }
        );
      }
      const urlObj = new URL(rawUrl);
      // Only allow http/https schemes and public hosts.
      if (!["http:", "https:"].includes(urlObj.protocol) || isPrivateHostname(urlObj.hostname)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "केवल http/https URL अनुमति छ" },
          { status: 400 }
        );
      }

      const ext = path.extname(urlObj.pathname).toLowerCase();
      const allowedRemoteExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
      if (!allowedRemoteExtensions.includes(ext)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "केवल सार्वजनिक छवि URL अनुमति छ" },
          { status: 400 }
        );
      }
      const filename = `url-${Date.now()}${ext}`;
      const original_name = decodeURIComponent(path.basename(urlObj.pathname)) || filename;

      const mediaFile = await prisma.mediaFile.create({
        data: {
          filename,
          original_name,
          mime_type: "image/jpeg", // placeholder; browser shows actual content
          size: 0,
          url: rawUrl,
          alt_text: (body.alt_text ?? "").trim().slice(0, 500) || null,
          uploaded_by: session!.user.id,
        },
      });

      await auditLog({
        adminId: session!.user.id,
        action: "CREATE",
        entity: "MediaFile",
        entityId: mediaFile.id,
        newValue: { url: rawUrl, original_name },
      });

      return NextResponse.json<ApiResponse>(
        { success: true, data: mediaFile },
        { status: 201 }
      );
    }

    // ── File upload ─────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altTextValue = formData.get("alt_text");
    const altText = typeof altTextValue === "string" ? altTextValue.trim().slice(0, 500) : null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "फाइल आवश्यक छ" },
        { status: 400 }
      );
    }

    const safeExtension = extensionForMimeType(file.type);
    if (!safeExtension) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "यो फाइल प्रकार समर्थित छैन" },
        { status: 400 }
      );
    }

    // Videos are allowed a larger limit than images/PDFs.
    const isVideoFile = file.type.startsWith("video/");
    const maxSize = isVideoFile ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB video, 10MB other
    const maxSizeLabel = isVideoFile ? "१०० MB" : "१० MB";
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `फाइल साइज ${maxSizeLabel} भन्दा बढी हुनु हुँदैन` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!hasValidFileSignature(buffer, file.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "फाइलको सामग्री घोषित प्रकारसँग मेल खाँदैन" },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${crypto.randomUUID()}${safeExtension}`;
    const originalName = sanitizeOriginalFilename(file.name);

    const storage = getStorageProvider();
    const uploadResult = await storage.upload(buffer, filename, file.type);

    const url = uploadResult.url;

    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        original_name: originalName,
        mime_type: file.type,
        size: file.size,
        url,
        alt_text: altText || null,
        uploaded_by: session!.user.id,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        variants: uploadResult.publicId ? { cloudinary_public_id: uploadResult.publicId } : undefined,
      },
    });

    await auditLog({
      adminId: session!.user.id,
      action: "CREATE",
      entity: "MediaFile",
      entityId: mediaFile.id,
      newValue: { filename: mediaFile.original_name, mime_type: mediaFile.mime_type },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: mediaFile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "फाइल अपलोड गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
