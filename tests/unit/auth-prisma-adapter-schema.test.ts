import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Auth.js Prisma adapter schema", () => {
  it("exposes emailVerified while preserving the email_verified column mapping", () => {
    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toMatch(/emailVerified\s+DateTime\?\s+@map\("email_verified"\)/);
    expect(schema).not.toMatch(/email_verified\s+DateTime\?/);
  });
});
