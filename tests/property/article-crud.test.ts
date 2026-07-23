if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-art-crud";
let testAuthorId: string;
let testCategoryId: string;

beforeAll(async () => {
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });

  const author = await prisma.user.create({
    data: {
      name: "CRUD Test Author",
      email: `${TEST_PREFIX}-author@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "AUTHOR",
    },
  });
  testAuthorId = author.id;

  const cat = await prisma.category.create({
    data: { name: "CRUD Test Category", slug: `${TEST_PREFIX}-cat` },
  });
  testCategoryId = cat.id;
});

afterAll(async () => {
  await prisma.article.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

const slugSuffixArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 3 && s.length <= 30);

const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);
const contentArb = fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0);
const excerptArb = fc.string({ minLength: 0, maxLength: 200 });

describe("Property 1: Article Creation Persists All Fields", () => {
  it("all provided fields are stored correctly (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        slugSuffixArb,
        titleArb,
        contentArb,
        excerptArb,
        fc.boolean(),
        async (suffix, title, content, excerpt, isFeatured) => {
          const slug = `${TEST_PREFIX}-create-${suffix}`;
          await prisma.article.deleteMany({ where: { slug } });

          const article = await prisma.article.create({
            data: {
              title,
              slug,
              content,
              excerpt: excerpt || null,
              is_featured: isFeatured,
              category_id: testCategoryId,
              author_id: testAuthorId,
              status: "DRAFT",
            },
          });

          expect(article.title).toBe(title);
          expect(article.slug).toBe(slug);
          expect(article.content).toBe(content);
          expect(article.excerpt).toBe(excerpt || null);
          expect(article.is_featured).toBe(isFeatured);
          expect(article.status).toBe("DRAFT");
          expect(article.category_id).toBe(testCategoryId);
          expect(article.author_id).toBe(testAuthorId);

          // Re-read from DB to confirm persistence
          const fetched = await prisma.article.findUnique({ where: { id: article.id } });
          expect(fetched).not.toBeNull();
          expect(fetched!.title).toBe(title);
          expect(fetched!.slug).toBe(slug);

          await prisma.article.delete({ where: { id: article.id } });
        }
      ),
      { numRuns: 110 }
    );
  });
});

describe("Property 2: Article Update Preserves Unchanged Fields", () => {
  it("only updated fields change, others remain the same (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        slugSuffixArb,
        titleArb,
        titleArb,
        async (suffix, originalTitle, newTitle) => {
          const slug = `${TEST_PREFIX}-update-${suffix}`;
          await prisma.article.deleteMany({ where: { slug } });

          const original = await prisma.article.create({
            data: {
              title: originalTitle,
              slug,
              content: "Original content that should not change",
              excerpt: "Original excerpt",
              category_id: testCategoryId,
              author_id: testAuthorId,
              status: "DRAFT",
              is_featured: false,
            },
          });

          const updated = await prisma.article.update({
            where: { id: original.id },
            data: { title: newTitle },
          });

          // Updated field changed
          expect(updated.title).toBe(newTitle);
          // Unchanged fields preserved
          expect(updated.slug).toBe(slug);
          expect(updated.content).toBe("Original content that should not change");
          expect(updated.excerpt).toBe("Original excerpt");
          expect(updated.is_featured).toBe(false);
          expect(updated.category_id).toBe(testCategoryId);
          expect(updated.author_id).toBe(testAuthorId);
          expect(updated.status).toBe("DRAFT");

          await prisma.article.delete({ where: { id: original.id } });
        }
      ),
      { numRuns: 110 }
    );
  });
});

describe("Property 3: Publishing Transitions Status and Sets published_at", () => {
  it("DRAFT → PUBLISHED sets published_at (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(slugSuffixArb, async (suffix) => {
        const slug = `${TEST_PREFIX}-publish-${suffix}`;
        await prisma.article.deleteMany({ where: { slug } });

        const draft = await prisma.article.create({
          data: {
            title: `Publish Test ${suffix}`,
            slug,
            content: "Content for publish test",
            category_id: testCategoryId,
            author_id: testAuthorId,
            status: "DRAFT",
          },
        });

        expect(draft.status).toBe("DRAFT");
        expect(draft.published_at).toBeNull();

        const beforePublish = new Date();
        const published = await prisma.article.update({
          where: { id: draft.id },
          data: {
            status: "PUBLISHED",
            published_at: new Date(),
          },
        });

        expect(published.status).toBe("PUBLISHED");
        expect(published.published_at).not.toBeNull();
        expect(published.published_at!.getTime()).toBeGreaterThanOrEqual(
          beforePublish.getTime() - 1000
        );

        await prisma.article.delete({ where: { id: draft.id } });
      }),
      { numRuns: 110 }
    );
  });
});
