import { describe, expect, it } from "vitest";
import {
  extensionForMimeType,
  hasValidFileSignature,
  sanitizeOriginalFilename,
} from "@/lib/upload-validation";

describe("upload validation", () => {
  it("accepts a PNG only when its signature matches", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const spoofed = Buffer.from("<script>alert(1)</script>");

    expect(hasValidFileSignature(png, "image/png")).toBe(true);
    expect(hasValidFileSignature(spoofed, "image/png")).toBe(false);
  });

  it("accepts supported PDF and media signatures", () => {
    expect(hasValidFileSignature(Buffer.from("%PDF-1.7"), "application/pdf")).toBe(true);
    expect(hasValidFileSignature(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), "video/webm")).toBe(true);
    expect(
      hasValidFileSignature(Buffer.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]), "video/mp4")
    ).toBe(true);
  });

  it("derives extensions from verified MIME types", () => {
    expect(extensionForMimeType("image/jpeg")).toBe(".jpg");
    expect(extensionForMimeType("application/pdf")).toBe(".pdf");
    expect(extensionForMimeType("text/html")).toBeNull();
  });

  it("stores only a bounded basename as the original filename", () => {
    expect(sanitizeOriginalFilename("../nested/report.pdf")).toBe("report.pdf");
    expect(sanitizeOriginalFilename("a".repeat(300) + ".jpg").length).toBeLessThanOrEqual(255);
  });
});
