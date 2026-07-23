const mimeExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export function extensionForMimeType(mimeType: string): string | null {
  return mimeExtensions[mimeType] ?? null;
}

export function hasValidFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4 || !extensionForMimeType(mimeType)) return false;

  switch (mimeType) {
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/gif":
      return ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a";
    case "image/webp":
      return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
    case "image/avif":
      return ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12));
    case "video/mp4":
      return ascii(bytes, 4, 8) === "ftyp";
    case "video/webm":
      return startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
    case "application/pdf":
      return ascii(bytes, 0, 5) === "%PDF-";
    default:
      return false;
  }
}

export function sanitizeOriginalFilename(filename: string): string {
  const basename = filename.replace(/\\/g, "/").split("/").pop()?.trim() || "upload";
  return basename.replace(/[\u0000-\u001f\u007f]/g, "").slice(-255) || "upload";
}
