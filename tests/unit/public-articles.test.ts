import { describe, expect, it } from "vitest";
import {
  buildArticleVisibilityUpdateData,
  buildActiveContentByIdWhere,
  buildActiveContentListWhere,
  buildPublishedArticleByIdWhere,
  decodeArticleSlugParam,
  decodePublicSlugParam,
  publicContentPath,
  publicArticlePath,
  buildPublicArticleWhere,
  buildPublicBreakingNewsWhere,
} from "@/lib/public-articles";

describe("public article visibility", () => {
  it("keeps public article feeds published-only even when another status is requested", () => {
    expect(
      buildPublicArticleWhere({
        category: "sports-category-id",
        status: "DRAFT",
        search: "football",
      })
    ).toEqual({
      status: "PUBLISHED",
      category_id: "sports-category-id",
      OR: [
        { title: { contains: "football", mode: "insensitive" } },
        { content: { contains: "football", mode: "insensitive" } },
        { excerpt: { contains: "football", mode: "insensitive" } },
      ],
    });
  });

  it("only exposes breaking news linked to published articles", () => {
    const now = new Date("2026-07-01T00:00:00.000Z");

    expect(buildPublicBreakingNewsWhere(now)).toEqual({
      is_active: true,
      AND: [
        { OR: [{ expires_at: null }, { expires_at: { gt: now } }] },
        { OR: [{ article_id: null }, { article: { status: "PUBLISHED" } }] },
      ],
    });
  });

  it("removes featured placement and publish date when an article is moved back to draft", () => {
    expect(
      buildArticleVisibilityUpdateData("PUBLISHED", {
        status: "DRAFT",
        is_featured: true,
      })
    ).toEqual({
      status: "DRAFT",
      is_featured: false,
      published_at: null,
    });
  });

  it("sets a publish date when an article transitions from draft to published", () => {
    const before = Date.now();
    const update = buildArticleVisibilityUpdateData("DRAFT", {
      status: "PUBLISHED",
    });
    const after = Date.now();

    expect(update.status).toBe("PUBLISHED");
    expect(update.published_at).toBeInstanceOf(Date);
    expect((update.published_at as Date).getTime()).toBeGreaterThanOrEqual(before);
    expect((update.published_at as Date).getTime()).toBeLessThanOrEqual(after);
  });

  it("encodes article slugs with spaces and Nepali characters for links", () => {
    expect(publicArticlePath("कर्णाली र बागमती बने च्याम्पियन")).toBe(
      "/articles/%E0%A4%95%E0%A4%B0%E0%A5%8D%E0%A4%A3%E0%A4%BE%E0%A4%B2%E0%A5%80%20%E0%A4%B0%20%E0%A4%AC%E0%A4%BE%E0%A4%97%E0%A4%AE%E0%A4%A4%E0%A5%80%20%E0%A4%AC%E0%A4%A8%E0%A5%87%20%E0%A4%9A%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A4%BF%E0%A4%AF%E0%A4%A8"
    );
  });

  it("decodes encoded route params before looking up article slugs", () => {
    expect(
      decodeArticleSlugParam(
        "%E0%A4%95%E0%A4%B0%E0%A5%8D%E0%A4%A3%E0%A4%BE%E0%A4%B2%E0%A5%80%20%E0%A4%B0"
      )
    ).toBe("कर्णाली र");
  });

  it("encodes other public slug paths such as reels and galleries", () => {
    expect(publicContentPath("/reels", "आजको भिडियो")).toBe(
      "/reels/%E0%A4%86%E0%A4%9C%E0%A4%95%E0%A5%8B%20%E0%A4%AD%E0%A4%BF%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A5%8B"
    );
    expect(publicContentPath("/galleries", "फोटो कथा")).toBe(
      "/galleries/%E0%A4%AB%E0%A5%8B%E0%A4%9F%E0%A5%8B%20%E0%A4%95%E0%A4%A5%E0%A4%BE"
    );
  });

  it("decodes generic public slug params", () => {
    expect(decodePublicSlugParam("%E0%A4%AB%E0%A5%8B%E0%A4%9F%E0%A5%8B%20%E0%A4%95%E0%A4%A5%E0%A4%BE")).toBe(
      "फोटो कथा"
    );
  });

  it("keeps ID-based public article operations published-only", () => {
    expect(buildPublishedArticleByIdWhere("article-1")).toEqual({
      id: "article-1",
      status: "PUBLISHED",
    });
  });

  it("keeps direct reel/gallery fetches active-only", () => {
    expect(buildActiveContentByIdWhere("content-1")).toEqual({
      id: "content-1",
      is_active: true,
    });
  });

  it("only lists inactive reels/galleries when an authorized manager asks for them", () => {
    expect(buildActiveContentListWhere({ includeInactive: false, canManage: true })).toEqual({
      is_active: true,
    });
    expect(buildActiveContentListWhere({ includeInactive: true, canManage: false })).toEqual({
      is_active: true,
    });
    expect(buildActiveContentListWhere({ includeInactive: true, canManage: true })).toEqual({});
  });
});
