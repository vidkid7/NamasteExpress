export const AD_SIZE_OPTIONS = [
  { value: "MOBILE_BANNER", label: "Mobile banner", dimensions: "320 × 50", maxWidth: 320, description: "Compact mobile placement" },
  { value: "MOBILE_LARGE", label: "Mobile large", dimensions: "320 × 100", maxWidth: 320, description: "Larger mobile-friendly banner" },
  { value: "MICRO", label: "Micro", dimensions: "180 × flexible", maxWidth: 180, description: "Compact badge or narrow sponsor" },
  { value: "SMALL", label: "Small", dimensions: "280 × flexible", maxWidth: 280, description: "Small mobile-friendly banner" },
  { value: "RECTANGLE", label: "Medium rectangle", dimensions: "300 × 250", maxWidth: 300, description: "Standard content or sidebar unit" },
  { value: "SQUARE", label: "Square", dimensions: "300 × 300", maxWidth: 300, description: "Responsive 1:1 creative" },
  { value: "MEDIUM", label: "Medium", dimensions: "440 × flexible", maxWidth: 440, description: "Standard banner (recommended)" },
  { value: "LARGE", label: "Large", dimensions: "640 × flexible", maxWidth: 640, description: "Large responsive banner" },
  { value: "LEADERBOARD", label: "Leaderboard", dimensions: "728 × 90", maxWidth: 728, description: "Classic horizontal banner" },
  { value: "WIDE", label: "Wide", dimensions: "970 × flexible", maxWidth: 970, description: "Wide campaign banner" },
  { value: "LARGE_LEADERBOARD", label: "Large leaderboard", dimensions: "970 × 90", maxWidth: 970, description: "Extra-wide campaign banner" },
  { value: "HALF_PAGE", label: "Half page", dimensions: "300 × 600", maxWidth: 300, description: "Tall sidebar creative" },
  { value: "SKYSCRAPER", label: "Skyscraper", dimensions: "160 × 600", maxWidth: 160, description: "Narrow tall sidebar creative" },
  { value: "FULL", label: "Full width", dimensions: "Placement width", maxWidth: null, description: "Use all available placement width" },
  { value: "CUSTOM", label: "Placement default", dimensions: "Placement width", maxWidth: null, description: "Use the position's configured width" },
] as const;

export type AdSize = (typeof AD_SIZE_OPTIONS)[number]["value"];

export function isAdSize(value: unknown): value is AdSize {
  return typeof value === "string" && AD_SIZE_OPTIONS.some((option) => option.value === value);
}

export function normalizeAdSize(value: unknown): AdSize {
  return isAdSize(value) ? value : "MEDIUM";
}

export function getAdSizeMaxWidth(size: unknown, placementWidth?: number | null) {
  const normalized = normalizeAdSize(size);
  if (normalized === "CUSTOM") return placementWidth ?? null;
  return AD_SIZE_OPTIONS.find((option) => option.value === normalized)?.maxWidth ?? 440;
}
