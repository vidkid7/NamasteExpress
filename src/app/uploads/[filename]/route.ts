import { readFile, stat } from "fs/promises";
import { NextRequest } from "next/server";
import { resolveLocalUploadPath } from "@/lib/storage";

export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webm: "video/webm",
  webp: "image/webp",
  mp4: "video/mp4",
};

function contentTypeFor(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return contentTypes[ext] ?? "application/octet-stream";
}

async function localUploadResponse(filename: string, includeBody: boolean) {
  const filePath = resolveLocalUploadPath(filename);
  if (!filePath) return new Response("Not found", { status: 404 });

  try {
    const fileStat = await stat(filePath);
    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(fileStat.size),
      "Content-Type": contentTypeFor(filename),
    });

    if (!includeBody) return new Response(null, { headers });

    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return localUploadResponse(filename, true);
}

export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return localUploadResponse(filename, false);
}
