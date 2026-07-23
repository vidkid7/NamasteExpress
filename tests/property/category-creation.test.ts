if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-cat-create";

afterAll(async () => {
  await prisma.category.deleteMany({ where: { slug: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

const slugSuffixArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 3 && s.length <= 30);

const nameArb = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0);

const colorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  )
  .map(([r, g, b]) => `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);

describe("Property 6: Category Creation Persists Fields", () => {
  it("name, slug, and color are stored correctly (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        slugSuffixArb,
        nameArb,
        colorArb,
        async (suffix, name, color) => {
          const slug = `${TEST_PREFIX}-${suffix}`;
          await prisma.category.deleteMany({ where: { slug } });

          const category = await prisma.category.create({
            data: { name, slug, color },
          });

          expect(category.name).toBe(name);
          expect(category.slug).toBe(slug);
          expect(category.color).toBe(color);
          expect(category.is_active).toBe(true);

          // Re-read from DB
          const fetched = await prisma.category.findUnique({ where: { id: category.id } });
          expect(fetched).not.toBeNull();
          expect(fetched!.name).toBe(name);
          expect(fetched!.slug).toBe(slug);
          expect(fetched!.color).toBe(color);

          await prisma.category.delete({ where: { id: category.id } });
        }
      ),
      { numRuns: 110 }
    );
  });

  it("default color is applied when not specified (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(slugSuffixArb, nameArb, async (suffix, name) => {
        const slug = `${TEST_PREFIX}-def-${suffix}`;
        await prisma.category.deleteMany({ where: { slug } });

        const category = await prisma.category.create({
          data: { name, slug },
        });

        expect(category.color).toBe("#c62828");

        await prisma.category.delete({ where: { id: category.id } });
      }),
      { numRuns: 110 }
    );
  });
});
