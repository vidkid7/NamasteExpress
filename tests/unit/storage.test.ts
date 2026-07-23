import path from "path";
import { describe, expect, it } from "vitest";
import { resolveLocalUploadPath, resolveStorageProviderType } from "@/lib/storage";

describe("storage provider selection", () => {
  it("uses Cloudinary by default when credentials are configured", () => {
    expect(
      resolveStorageProviderType({
        CLOUDINARY_CLOUD_NAME: "demo-cloud",
        CLOUDINARY_API_KEY: "demo-key",
        CLOUDINARY_API_SECRET: "demo-secret",
      })
    ).toBe("cloudinary");
  });

  it("honors an explicit local storage provider", () => {
    expect(
      resolveStorageProviderType({
        STORAGE_PROVIDER: "local",
        CLOUDINARY_CLOUD_NAME: "demo-cloud",
        CLOUDINARY_API_KEY: "demo-key",
        CLOUDINARY_API_SECRET: "demo-secret",
      })
    ).toBe("local");
  });
});

describe("local upload path resolution", () => {
  const cwd = path.resolve("C:/site");

  it("resolves upload filenames inside public/uploads", () => {
    expect(resolveLocalUploadPath("news-image.webp", cwd)).toBe(
      path.join(cwd, "public", "uploads", "news-image.webp")
    );
  });

  it("rejects traversal and nested paths", () => {
    expect(resolveLocalUploadPath("../secret.txt", cwd)).toBeNull();
    expect(resolveLocalUploadPath("nested/secret.txt", cwd)).toBeNull();
    expect(resolveLocalUploadPath("", cwd)).toBeNull();
  });
});
