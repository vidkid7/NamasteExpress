export const AD_SIZE_OPTIONS = [
  { value: "MICRO", label: "Micro", maxWidth: 180, description: "Compact badge or narrow sponsor" },
  { value: "SMALL", label: "Small", maxWidth: 280, description: "Small mobile-friendly banner" },
  { value: "MEDIUM", label: "Medium", maxWidth: 440, description: "Standard banner (recommended)" },
  { value: "LARGE", label: "Large", maxWidth: 640, description: "Large responsive banner" },
  { value: "WIDE", label: "Wide", maxWidth: 970, description: "Wide campaign banner" },
  { value: "FULL", label: "Full width", maxWidth: null, description: "Use all available placement width" },
  { value: "CUSTOM", label: "Placement default", maxWidth: null, description: "Use the position's configured width" },
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
