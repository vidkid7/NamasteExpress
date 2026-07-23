import { describe, expect, it, vi } from "vitest";
import { adminPath } from "@/lib/admin-path";

describe("adminPath", () => {
  it("uses the configured public admin path for admin links", () => {
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SECRET_PATH", "staff-vault-test");

    expect(adminPath()).toBe("/staff-vault-test");
    expect(adminPath("/articles")).toBe("/staff-vault-test/articles");
    expect(adminPath("articles/new")).toBe("/staff-vault-test/articles/new");

    vi.unstubAllEnvs();
  });

  it("falls back to /admin when no secret path is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_ADMIN_SECRET_PATH", "");
    vi.stubEnv("ADMIN_SECRET_PATH", "");

    expect(adminPath()).toBe("/admin");
    expect(adminPath("/articles")).toBe("/admin/articles");

    vi.unstubAllEnvs();
  });
});
