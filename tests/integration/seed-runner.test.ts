import { prisma } from "@/lib/prisma";
import { afterAll, describe, expect, it } from "vitest";
import { createSeedClock } from "../../prisma/seed-data/seed-date";
import { verifySeed } from "../../prisma/seed-data/seed-runner";

describe("verifySeed", () => {
  afterAll(() => prisma.$disconnect());

  it("confirms the dedicated database contains every public dataset", async () => {
    const summary = await verifySeed(prisma, createSeedClock("2026-07-23"));
    expect(summary.article).toBeGreaterThanOrEqual(36);
    expect(summary.category).toBe(17);
    expect(summary.forexRate).toBe(21);
    expect(summary.rashifal).toBe(12);
    expect(summary.session).toBe(0);
    expect(summary.passwordResetToken).toBe(0);
  });
});
