import { editorialFixtures } from "./editorial-fixtures";
import { verifiedSnapshots } from "./verified-snapshots";

export function validateSeedFixtures(): void {
  const slugs = editorialFixtures.articles.map((article) => article.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Seed article slugs must be unique");
  }
  if (editorialFixtures.articles.length < 36) {
    throw new Error("Seed must contain at least 36 editorial article fixtures");
  }
  if (editorialFixtures.rashifalSigns.length !== 12) {
    throw new Error("Seed must contain exactly 12 rashifal signs");
  }
  if (verifiedSnapshots.forex.rates.length !== 21) {
    throw new Error("Forex snapshot must contain 21 currencies");
  }
  for (const rate of verifiedSnapshots.forex.rates) {
    if (rate.unit <= 0 || rate.buy <= 0 || rate.sell <= 0) {
      throw new Error(`Invalid forex snapshot for ${rate.currency}`);
    }
  }
  for (const source of [
    verifiedSnapshots.forex.sourceUrl,
    verifiedSnapshots.goldSilver.sourceUrl,
    verifiedSnapshots.holidays.sourceUrl,
  ]) {
    if (!/^https:\/\//.test(source)) {
      throw new Error("Verified snapshots require HTTPS source URLs");
    }
  }
}
