import { describe, it, expect } from "vitest";
import fc from "fast-check";
import ne from "@/i18n/locales/ne.json";
import en from "@/i18n/locales/en.json";

// Flatten nested JSON keys into dot-separated paths
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

const neKeys = flattenKeys(ne as Record<string, unknown>);
const enKeys = flattenKeys(en as Record<string, unknown>);
const allKeys = [...new Set([...neKeys, ...enKeys])];

describe("Property 19: Language Switching — Translation Key Completeness", () => {
  it("every Nepali key exists in English (100+ iterations)", () => {
    const neKeyArb = fc.constantFrom(...neKeys);
    fc.assert(
      fc.property(neKeyArb, (key) => {
        const enValue = getNestedValue(en as Record<string, unknown>, key);
        expect(enValue).toBeDefined();
        expect(typeof enValue).toBe("string");
      }),
      { numRuns: Math.min(neKeys.length * 2, 200) }
    );
  });

  it("every English key exists in Nepali (100+ iterations)", () => {
    const enKeyArb = fc.constantFrom(...enKeys);
    fc.assert(
      fc.property(enKeyArb, (key) => {
        const neValue = getNestedValue(ne as Record<string, unknown>, key);
        expect(neValue).toBeDefined();
        expect(typeof neValue).toBe("string");
      }),
      { numRuns: Math.min(enKeys.length * 2, 200) }
    );
  });

  it("all keys have non-empty values in both languages (100+ iterations)", () => {
    const keyArb = fc.constantFrom(...allKeys);
    fc.assert(
      fc.property(keyArb, (key) => {
        const neVal = getNestedValue(ne as Record<string, unknown>, key);
        const enVal = getNestedValue(en as Record<string, unknown>, key);
        expect(typeof neVal).toBe("string");
        expect(typeof enVal).toBe("string");
        expect((neVal as string).length).toBeGreaterThan(0);
        expect((enVal as string).length).toBeGreaterThan(0);
      }),
      { numRuns: Math.min(allKeys.length * 2, 200) }
    );
  });
});
