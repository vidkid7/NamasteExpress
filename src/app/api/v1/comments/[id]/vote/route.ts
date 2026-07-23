import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth();
    if (error) return unauthorizedResponse();

    const { id: commentId } = await params;

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid content type" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const isLike = body.is_like === true;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "टिप्पणी फेला परेन" },
        { status: 404 }
      );
    }

    const existingVote = await prisma.commentVote.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: session!.user.id,
        },
      },
    });

    if (existingVote) {
      if (existingVote.is_like === isLike) {
        // Same vote type — remove the vote (toggle off)
        await prisma.$transaction([
          prisma.commentVote.delete({ where: { id: existingVote.id } }),
          prisma.comment.update({
            where: { id: commentId },
            data: isLike
              ? { like_count: { decrement: 1 } }
              : { dislike_count: { decrement: 1 } },
          }),
        ]);

        return NextResponse.json<ApiResponse>(
          { success: true, data: { action: "removed" } }
        );
      } else {
        // Different vote type — switch the vote
        await prisma.$transaction([
          prisma.commentVote.update({
            where: { id: existingVote.id },
            data: { is_like: isLike },
          }),
          prisma.comment.update({
            where: { id: commentId },
            data: isLike
              ? { like_count: { increment: 1 }, dislike_count: { decrement: 1 } }
              : { like_count: { decrement: 1 }, dislike_count: { increment: 1 } },
          }),
        ]);

        return NextResponse.json<ApiResponse>(
          { success: true, data: { action: "switched" } }
        );
      }
    }

    // New vote
    await prisma.$transaction([
      prisma.commentVote.create({
        data: {
          comment_id: commentId,
          user_id: session!.user.id,
          is_like: isLike,
        },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: isLike
          ? { like_count: { increment: 1 } }
          : { dislike_count: { increment: 1 } },
      }),
    ]);

    return NextResponse.json<ApiResponse>(
      { success: true, data: { action: "created" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vote POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "भोट गर्दा त्रुटि भयो" },
      { status: 500 }
    );
  }
}
