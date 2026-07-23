import { describe, expect, it } from "vitest";
import {
  breakingNewsCreateSchema,
  breakingNewsUpdateSchema,
  matchUpdateSchema,
  mediaUpdateSchema,
} from "@/lib/validations";

describe("mutation input validation", () => {
  it("bounds breaking-news fields and rejects unknown keys", () => {
    expect(breakingNewsCreateSchema.safeParse({ title: " News " }).success).toBe(true);
    expect(breakingNewsCreateSchema.safeParse({ title: "x".repeat(301) }).success).toBe(false);
    expect(breakingNewsCreateSchema.safeParse({ title: "News", unexpected: true }).success).toBe(false);
    expect(breakingNewsUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("accepts only a bounded nullable media alt text", () => {
    expect(mediaUpdateSchema.safeParse({ alt_text: null }).success).toBe(true);
    expect(mediaUpdateSchema.safeParse({ alt_text: "x".repeat(501) }).success).toBe(false);
  });

  it("coerces valid scores and rejects invalid match updates", () => {
    const valid = matchUpdateSchema.safeParse({ home_score: "2", status: "LIVE" });
    expect(valid.success && valid.data.home_score).toBe(2);
    expect(matchUpdateSchema.safeParse({ home_score: "-1" }).success).toBe(false);
    expect(matchUpdateSchema.safeParse({ status: "UNKNOWN" }).success).toBe(false);
    expect(matchUpdateSchema.safeParse({}).success).toBe(false);
  });
});
