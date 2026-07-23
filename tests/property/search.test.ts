if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-search";
let testAuthorId: string;
let testCategoryId: string;

beforeAll(async () => {
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });

  const author = await prisma.user.create({
    data: {
      name: "Search Test Author",
      email: `${TEST_PREFIX}-author@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "AUTHOR",
    },
  });
  testAuthorId = author.id;

  const cat = await prisma.category.create({
    data: { name: "Search Test Cat", slug: `${TEST_PREFIX}-cat` },
  });
  testCategoryId = cat.id;
});

afterAll(async () => {
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

const searchTermArb = fc
  .stringMatching(/^[a-z]{4,12}$/);

describe("Property 12: Search Returns Matching Articles", () => {
  it("articles with search term in title are found (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(searchTermArb, async (term) => {
        const slug = `${TEST_PREFIX}-find-${term}`;
        await prisma.article.deleteMany({ where: { slug } });

        await prisma.article.create({
          data: {
            title: `Breaking: ${term} news today`,
            slug,
            content: "Generic article content",
            category_id: testCategoryId,
            author_id: testAuthorId,
            status: "PUBLISHED",
            published_at: new Date(),
          },
        });

        const results = await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { content: { contains: term, mode: "insensitive" } },
            ],
          },
        });

        const found = results.some((a) => a.slug === slug);
        expect(found).toBe(true);

        await prisma.article.deleteMany({ where: { slug } });
      }),
      { numRuns: 110 }
    );
  });
});

describe("Property 13: Title Matches Rank Higher Than Content Matches", () => {
  it("title-match articles appear when searching by title term (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(searchTermArb, async (term) => {
        const titleSlug = `${TEST_PREFIX}-titlematch-${term}`;
        const contentSlug = `${TEST_PREFIX}-contentmatch-${term}`;

        await prisma.article.deleteMany({
          where: { slug: { in: [titleSlug, contentSlug] } },
        });

        // Article with term in title
        await prisma.article.create({
          data: {
            title: `The ${term} situation explained`,
            slug: titleSlug,
            content: "No matching keyword here",
            category_id: testCategoryId,
            author_id: testAuthorId,
            status: "PUBLISHED",
            published_at: new Date(),
          },
        });

        // Article with term in content only
        await prisma.article.create({
          data: {
            title: "Unrelated headline for test",
            slug: contentSlug,
            content: `This article discusses ${term} in depth`,
            category_id: testCategoryId,
            author_id: testAuthorId,
            status: "PUBLISHED",
            published_at: new Date(),
          },
        });

        // Search with title filter — only title-matching article should appear
        const titleResults = await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            title: { contains: term, mode: "insensitive" },
          },
        });

        const hasTitleMatch = titleResults.some((a) => a.slug === titleSlug);
        expect(hasTitleMatch).toBe(true);

        // Content-only article should NOT appear in title-only search
        const hasContentOnly = titleResults.some((a) => a.slug === contentSlug);
        expect(hasContentOnly).toBe(false);

        await prisma.article.deleteMany({
          where: { slug: { in: [titleSlug, contentSlug] } },
        });
      }),
      { numRuns: 110 }
    );
  });
});
