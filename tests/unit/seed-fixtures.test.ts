import { describe, expect, it } from "vitest";
import { editorialFixtures } from "../../prisma/seed-data/editorial-fixtures";
import { validateSeedFixtures } from "../../prisma/seed-data/validate-fixtures";
import { verifiedSnapshots } from "../../prisma/seed-data/verified-snapshots";

describe("seed fixtures", () => {
  it("covers homepage categories with unique article slugs", () => {
    expect(() => validateSeedFixtures()).not.toThrow();
    const slugs = editorialFixtures.articles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBeGreaterThanOrEqual(36);
  });

  it("contains attributed factual snapshots", () => {
    expect(verifiedSnapshots.forex.sourceUrl).toBe("https://www.nrb.org.np/forex/");
    expect(verifiedSnapshots.forex.rates).toHaveLength(21);
    expect(verifiedSnapshots.goldSilver.sourceUrl).toContain("fenegosida.org");
    expect(verifiedSnapshots.holidays.sourceUrl).toContain("moha.gov.np");
  });
});
