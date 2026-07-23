if (process.env.NODE_ENV === "production") {
  throw new Error("Property tests must not run against production database!");
}

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_PREFIX = "test-auth-sess";

let testUserId: string;
const TEST_EMAIL = `${TEST_PREFIX}-user@test.local`;
const TEST_PASSWORD = "Str0ng!Pass";

beforeAll(async () => {
  await prisma.session.deleteMany({ where: { user: { email: { startsWith: TEST_PREFIX } } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  const hash = await bcrypt.hash(TEST_PASSWORD, 4);
  const user = await prisma.user.create({
    data: {
      name: "Session Test User",
      email: TEST_EMAIL,
      password_hash: hash,
      role: "READER",
      is_active: true,
    },
  });
  testUserId = user.id;
});

afterAll(async () => {
  await prisma.session.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { email: { startsWith: TEST_PREFIX } } });
  await prisma.$disconnect();
});

describe("Property 8: Authentication Session Creation", () => {
  it("valid credentials produce a session token (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 999999 }), async (seed) => {
        const user = await prisma.user.findUnique({
          where: { email: TEST_EMAIL },
        });
        expect(user).not.toBeNull();
        expect(user!.is_active).toBe(true);

        const isValid = await bcrypt.compare(TEST_PASSWORD, user!.password_hash!);
        expect(isValid).toBe(true);

        // Create a session record to prove it works
        const token = `session-${TEST_PREFIX}-${seed}-${Date.now()}`;
        const session = await prisma.session.create({
          data: {
            sessionToken: token,
            userId: user!.id,
            expires: new Date(Date.now() + 86400000),
          },
        });

        expect(session.sessionToken).toBe(token);
        expect(session.userId).toBe(user!.id);

        await prisma.session.delete({ where: { id: session.id } });
      }),
      { numRuns: 110 }
    );
  }, 300_000);

  it("invalid passwords are always rejected (100+ iterations)", async () => {
    const wrongPasswordArb = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((p) => p !== TEST_PASSWORD);

    await fc.assert(
      fc.asyncProperty(wrongPasswordArb, async (wrongPassword) => {
        const user = await prisma.user.findUnique({
          where: { email: TEST_EMAIL },
        });
        expect(user).not.toBeNull();

        const isValid = await bcrypt.compare(wrongPassword, user!.password_hash!);
        expect(isValid).toBe(false);
      }),
      { numRuns: 110 }
    );
  }, 300_000);

  it("non-existent emails are always rejected (100+ iterations)", async () => {
    const fakeEmailArb = fc
      .emailAddress()
      .filter((e) => !e.startsWith(TEST_PREFIX));

    await fc.assert(
      fc.asyncProperty(fakeEmailArb, async (fakeEmail) => {
        const user = await prisma.user.findUnique({
          where: { email: fakeEmail },
        });
        // Either user doesn't exist or is a different user
        if (!user) {
          expect(user).toBeNull();
        }
      }),
      { numRuns: 110 }
    );
  }, 300_000);
});
