import { describe, expect, it } from "vitest";
import { createSeedClock } from "../../prisma/seed-data/seed-date";

describe("createSeedClock", () => {
  it("normalizes an explicit Nepal date to a stable UTC day", () => {
    const clock = createSeedClock("2026-07-23");
    expect(clock.isoDate).toBe("2026-07-23");
    expect(clock.day.toISOString()).toBe("2026-07-23T00:00:00.000Z");
    expect(clock.hoursAgo(2).toISOString()).toBe("2026-07-22T22:00:00.000Z");
  });

  it("rejects invalid overrides before seeding", () => {
    expect(() => createSeedClock("23-07-2026")).toThrow(
      "SEED_DATE must use YYYY-MM-DD",
    );
  });
});
