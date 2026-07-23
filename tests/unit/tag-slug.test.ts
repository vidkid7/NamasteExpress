import { describe, expect, it } from "vitest";
import { tagSlug } from "@/lib/tag-slug";

describe("tagSlug", () => {
  it("uses the English name when a Nepali name cannot produce an ASCII slug", () => {
    expect(tagSlug("क्युए परीक्षण", "QA Test")).toBe("qa-test");
  });

  it("keeps a URL-safe Unicode slug when the optional English name is absent", () => {
    expect(tagSlug("नेपाली समाचार")).toBe("नेपाली-समाचार");
  });
});
