if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-slug-uniq";
let testAuthorId: string;
let testCategoryId: string;

beforeAll(async () => {
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });

  // Create a test author and category for article creation
  const author = await prisma.user.create({
    data: {
      name: "Slug Test Author",
      email: `${TEST_PREFIX}-author@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "AUTHOR",
    },
  });
  testAuthorId = author.id;

  const cat = await prisma.category.create({
    data: {
      name: "Slug Test Category",
      slug: `${TEST_PREFIX}-cat`,
    },
  });
  testCategoryId = cat.id;
});

afterAll(async () => {
  // Cleanup in correct FK order
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

// Arbitrary for URL-safe slug suffixes
const slugSuffixArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 3 && s.length <= 40);

describe("Property 5: Universal Slug Uniqueness", () => {
  it("article slug unique constraint rejects duplicates (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(slugSuffixArb, async (suffix) => {
        const slug = `${TEST_PREFIX}-art-${suffix}`;

        // Ensure clean slate
        await prisma.article.deleteMany({ where: { slug } });

        // First create should succeed
        const first = await prisma.article.create({
          data: {
            title: `Article ${suffix}`,
            slug,
            content: "Test content",
            category_id: testCategoryId,
            author_id: testAuthorId,
          },
        });
        expect(first.slug).toBe(slug);

        // Second create with same slug must fail
        await expect(
          prisma.article.create({
            data: {
              title: `Article dup ${suffix}`,
              slug,
              content: "Dup content",
              category_id: testCategoryId,
              author_id: testAuthorId,
            },
          })
        ).rejects.toThrow();

        // Cleanup this iteration
        await prisma.article.deleteMany({ where: { slug } });
      }),
      { numRuns: 110 }
    );
  });

  it("category slug unique constraint rejects duplicates (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(slugSuffixArb, async (suffix) => {
        const slug = `${TEST_PREFIX}-catslug-${suffix}`;

        await prisma.category.deleteMany({ where: { slug } });

        const first = await prisma.category.create({
          data: { name: `Cat ${suffix}`, slug },
        });
        expect(first.slug).toBe(slug);

        await expect(
          prisma.category.create({
            data: { name: `Cat dup ${suffix}`, slug },
          })
        ).rejects.toThrow();

        await prisma.category.deleteMany({ where: { slug } });
      }),
      { numRuns: 110 }
    );
  });
});
