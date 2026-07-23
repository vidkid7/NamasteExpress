import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    const { articleId } = await params;

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        user_id_article_id: {
          user_id: session!.user.id,
          article_id: articleId,
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "बुकमार्क फेला परेन" },
        { status: 404 }
      );
    }

    await prisma.bookmark.delete({ where: { id: bookmark.id } });

    return NextResponse.json<ApiResponse>(
      { success: true, data: { article_id: articleId } }
    );
  } catch (error) {
    console.error("Bookmark DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "बुकमार्क हटाउँदा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
