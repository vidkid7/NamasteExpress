import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isPublicCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = new Date();
    const ad = await prisma.advertisement.findFirst({
      where: {
        id,
        is_active: true,
        AND: [
          { OR: [{ start_date: null }, { start_date: { lte: now } }] },
          { OR: [{ end_date: null }, { end_date: { gte: now } }] },
        ],
      },
      select: { image_url: true },
    });

    if (!ad?.image_url || !isPublicCloudinaryUrl(ad.image_url)) {
      return new Response("Not found", { status: 404 });
    }

    const upstream = await fetch(ad.image_url, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return new Response("Image unavailable", { status: 502 });
    }

    const headers = new Headers({
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
    });
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(upstream.body, { headers });
  } catch (error) {
    console.error("Ad image relay error:", error);
    return new Response("Image unavailable", { status: 502 });
  }
}
