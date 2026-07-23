import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";
import { auditLog } from "@/lib/audit";
import { getStorageProvider } from "@/lib/storage";
import { mediaUpdateSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN", "EDITOR", "AUTHOR"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.mediaFile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "मिडिया फाइल फेला परेन" },
        { status: 404 }
      );
    }

    const parsed = mediaUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const mediaFile = await prisma.mediaFile.update({
      where: { id },
      data: parsed.data,
    });

    await auditLog({
      adminId: session!.user.id,
      action: "UPDATE",
      entity: "MediaFile",
      entityId: mediaFile.id,
      oldValue: { alt_text: existing.alt_text },
      newValue: { alt_text: mediaFile.alt_text },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: mediaFile });
  } catch (error) {
    console.error("Media PUT error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "मिडिया फाइल अपडेट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireRole(["ADMIN"]);
    if (error === "unauthorized") return unauthorizedResponse();
    if (error === "forbidden") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.mediaFile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "मिडिया फाइल फेला परेन" },
        { status: 404 }
      );
    }

    // Delete file from storage provider
    const storage = getStorageProvider();
    const publicId = (existing.variants as Record<string, string> | null)?.cloudinary_public_id;
    await storage.delete(existing.url, publicId);

    await prisma.mediaFile.delete({ where: { id } });

    await auditLog({
      adminId: session!.user.id,
      action: "DELETE",
      entity: "MediaFile",
      entityId: id,
      oldValue: { filename: existing.original_name },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "मिडिया फाइल मेटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
