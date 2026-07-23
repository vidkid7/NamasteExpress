if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-img-var";
let testUploaderId: string;

beforeAll(async () => {
  await prisma.mediaFile.deleteMany({ where: { filename: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });

  const user = await prisma.user.create({
    data: {
      name: "Image Test User",
      email: `${TEST_PREFIX}-user@test.local`,
      password_hash: "$2a$12$placeholder",
      role: "AUTHOR",
    },
  });
  testUploaderId = user.id;
});

afterAll(async () => {
  await prisma.mediaFile.deleteMany({ where: { filename: { startsWith: TEST_PREFIX } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

const dimensionArb = fc.integer({ min: 1, max: 10000 });
const mimeArb = fc.constantFrom("image/jpeg", "image/png", "image/webp", "image/avif");

// Variant structure: { name, width, height, url }
const variantArb = fc.record({
  name: fc.constantFrom("thumbnail", "small", "medium", "large", "og"),
  width: dimensionArb,
  height: dimensionArb,
  url: fc.webUrl(),
});

const variantsArb = fc.array(variantArb, { minLength: 1, maxLength: 5 });

describe("Property 4: Image Variant Generation Metadata", () => {
  it("variant metadata is properly structured when stored (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-z0-9]+$/.test(s)),
        mimeArb,
        dimensionArb,
        dimensionArb,
        variantsArb,
        async (fileSuffix, mimeType, width, height, variants) => {
          const filename = `${TEST_PREFIX}-${fileSuffix}`;

          await prisma.mediaFile.deleteMany({ where: { filename } });

          const media = await prisma.mediaFile.create({
            data: {
              filename,
              original_name: `original-${fileSuffix}.jpg`,
              mime_type: mimeType,
              size: 1024,
              url: `/uploads/${filename}`,
              width,
              height,
              variants: variants as object,
              uploaded_by: testUploaderId,
            },
          });

          expect(media.variants).not.toBeNull();

          // Re-read and validate structure
          const fetched = await prisma.mediaFile.findUnique({ where: { id: media.id } });
          expect(fetched).not.toBeNull();

          const storedVariants = fetched!.variants as Array<{
            name: string;
            width: number;
            height: number;
            url: string;
          }>;

          expect(Array.isArray(storedVariants)).toBe(true);
          expect(storedVariants.length).toBe(variants.length);

          for (const v of storedVariants) {
            expect(v).toHaveProperty("name");
            expect(v).toHaveProperty("width");
            expect(v).toHaveProperty("height");
            expect(v).toHaveProperty("url");
            expect(typeof v.name).toBe("string");
            expect(typeof v.width).toBe("number");
            expect(typeof v.height).toBe("number");
            expect(typeof v.url).toBe("string");
            expect(v.width).toBeGreaterThan(0);
            expect(v.height).toBeGreaterThan(0);
          }

          await prisma.mediaFile.delete({ where: { id: media.id } });
        }
      ),
      { numRuns: 110 }
    );
  });
});
