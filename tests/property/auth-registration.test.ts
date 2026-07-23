import { describe, it, expect } from "vitest";
import fc from "fast-check";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

describe("Property 7: User Registration with Password Hashing", () => {
  it("bcrypt hash never equals the original password (100+ iterations)", async () => {
    // Use lower cost factor (4) to keep tests fast
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 72 }),
        async (password) => {
          const hash = await bcrypt.hash(password, 4);
          expect(hash).not.toBe(password);
          expect(hash.startsWith("$2")).toBe(true);
          const matches = await bcrypt.compare(password, hash);
          expect(matches).toBe(true);
        }
      ),
      { numRuns: 110 }
    );
  }, 60_000);

  it("bcrypt hash is deterministic per-password verification (100+ iterations)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 72 }),
        async (password) => {
          const hash1 = await bcrypt.hash(password, 4);
          const hash2 = await bcrypt.hash(password, 4);
          // Different salts → different hashes
          expect(hash1).not.toBe(hash2);
          // But both verify against original
          expect(await bcrypt.compare(password, hash1)).toBe(true);
          expect(await bcrypt.compare(password, hash2)).toBe(true);
        }
      ),
      { numRuns: 110 }
    );
  }, 60_000);

  it("password strength validation rejects weak passwords (100+ iterations)", () => {
    // Passwords that miss at least one requirement
    const weakPasswordArb = fc.oneof(
      fc.string({ minLength: 1, maxLength: 7 }), // too short
      fc.constant("alllowercase1!"), // no uppercase
      fc.constant("ALLUPPERCASE1!"), // no lowercase
      fc.constant("NoDigitsHere!"), // no digit
      fc.constant("NoSpecial1abc") // no special
    );

    fc.assert(
      fc.property(weakPasswordArb, (password) => {
        const result = registerSchema.safeParse({
          name: "Test User",
          email: "test@example.com",
          password,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 120 }
    );
  });

  it("password strength validation accepts strong passwords (100+ iterations)", () => {
    // Generate passwords that satisfy all constraints using stringMatching
    const strongPasswordArb = fc
      .tuple(
        fc.stringMatching(/^[a-z]{1,4}$/),
        fc.stringMatching(/^[A-Z]{1,4}$/),
        fc.stringMatching(/^[0-9]{1,4}$/),
        fc.constantFrom("!", "@", "#", "$", "%", "^", "&", "*")
      )
      .map(([lower, upper, digit, special]) => lower + upper + digit + special)
      .filter((p) => p.length >= 8);

    fc.assert(
      fc.property(strongPasswordArb, (password) => {
        const result = registerSchema.safeParse({
          name: "Test User",
          email: "test@example.com",
          password,
        });
        expect(result.success).toBe(true);
      }),
      { numRuns: 120 }
    );
  });
});
