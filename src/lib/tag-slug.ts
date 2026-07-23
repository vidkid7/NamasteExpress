import { slugify } from "@/lib/utils";

export function tagSlug(name: string, nameEn?: string | null): string {
  const englishSlug = slugify(nameEn || "");
  if (englishSlug) return englishSlug;

  return name
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/gu, "-")
    .replace(/[^\p{L}\p{N}\p{M}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
