export const editorialFixtures = {
  categories: [
    "samachar", "rajniti", "arthatantra", "khelkud", "prabidhi", "bichar",
    "antarvaarta", "feature", "cover-story", "saptaahanta", "antarrashtriya",
    "sahitya", "bichitra", "video", "photo-gallery", "swasthya", "shiksha",
  ],
  articles: Array.from({ length: 36 }, (_, index) => ({
    slug: `demo-seed-article-${index + 1}`,
    category: [
      "samachar", "rajniti", "arthatantra", "khelkud", "prabidhi", "bichar",
      "antarvaarta", "feature", "cover-story", "saptaahanta", "antarrashtriya",
      "sahitya", "bichitra", "video", "photo-gallery", "swasthya", "shiksha",
    ][index % 17],
  })),
  rashifalSigns: [
    "mesh", "brish", "mithun", "karkat", "simha", "kanya",
    "tula", "brishchik", "dhanu", "makar", "kumbha", "meen",
  ],
} as const;
