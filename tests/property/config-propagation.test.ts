if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, afterAll } from "vitest";
import fc from "fast-check";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-config-prop";

afterAll(async () => {
  await prisma.siteSettings.deleteMany({
    where: { key: { startsWith: TEST_PREFIX } },
  });
  await prisma.$disconnect();
});

const configKeyArb = fc
  .stringMatching(/^[a-z_]{3,20}$/)
  .map((k) => `${TEST_PREFIX}_${k}`);

const configValueArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 100 }).map((s) => JSON.stringify(s)),
  fc.integer().map((n) => JSON.stringify(n)),
  fc.boolean().map((b) => JSON.stringify(b))
);

describe("Property 20: Dynamic Config Propagation", () => {
  it("config changes are persisted and retrievable (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(configKeyArb, configValueArb, async (key, jsonValue) => {
        const value = JSON.parse(jsonValue);

        // Upsert the setting
        await prisma.siteSettings.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object },
        });

        // Retrieve and verify
        const setting = await prisma.siteSettings.findUnique({ where: { key } });
        expect(setting).not.toBeNull();
        expect(setting!.value).toEqual(value);

        // Cleanup
        await prisma.siteSettings.delete({ where: { key } });
      }),
      { numRuns: 110 }
    );
  });

  it("config updates overwrite previous values (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        configKeyArb,
        configValueArb,
        configValueArb,
        async (key, jsonValue1, jsonValue2) => {
          const value1 = JSON.parse(jsonValue1);
          const value2 = JSON.parse(jsonValue2);

          // Create initial
          await prisma.siteSettings.upsert({
            where: { key },
            update: { value: value1 as object },
            create: { key, value: value1 as object },
          });

          let setting = await prisma.siteSettings.findUnique({ where: { key } });
          expect(setting!.value).toEqual(value1);

          // Update
          await prisma.siteSettings.update({
            where: { key },
            data: { value: value2 as object },
          });

          setting = await prisma.siteSettings.findUnique({ where: { key } });
          expect(setting!.value).toEqual(value2);

          await prisma.siteSettings.delete({ where: { key } });
        }
      ),
      { numRuns: 110 }
    );
  });
});
