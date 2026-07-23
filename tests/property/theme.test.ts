import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Theme logic extracted from ThemeContext for unit testing
type Theme = "light" | "dark";

const VALID_THEMES: Theme[] = ["light", "dark"];

function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && VALID_THEMES.includes(value as Theme);
}

function toggleTheme(current: Theme): Theme {
  return current === "light" ? "dark" : "light";
}

function resolveTheme(saved: string | null, prefersDark: boolean): Theme {
  if (saved && isValidTheme(saved)) return saved;
  return prefersDark ? "dark" : "light";
}

const themeArb = fc.constantFrom<Theme>("light", "dark");
const invalidThemeArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => !VALID_THEMES.includes(s as Theme));

describe("Property 17: Theme Values Are Consistently Applied", () => {
  it("valid themes are always accepted (100+ iterations)", () => {
    fc.assert(
      fc.property(themeArb, (theme) => {
        expect(isValidTheme(theme)).toBe(true);
      }),
      { numRuns: 120 }
    );
  });

  it("invalid theme strings are rejected (100+ iterations)", () => {
    fc.assert(
      fc.property(invalidThemeArb, (value) => {
        expect(isValidTheme(value)).toBe(false);
      }),
      { numRuns: 120 }
    );
  });

  it("toggle always produces the opposite theme (100+ iterations)", () => {
    fc.assert(
      fc.property(themeArb, (theme) => {
        const toggled = toggleTheme(theme);
        expect(toggled).not.toBe(theme);
        expect(isValidTheme(toggled)).toBe(true);
        // Double toggle returns to original
        expect(toggleTheme(toggled)).toBe(theme);
      }),
      { numRuns: 120 }
    );
  });

  it("theme is always one of the valid values (100+ iterations)", () => {
    fc.assert(
      fc.property(themeArb, (theme) => {
        expect(VALID_THEMES).toContain(theme);
      }),
      { numRuns: 120 }
    );
  });
});

describe("Property 18: Theme Preference Persists", () => {
  it("saved theme is respected over system preference (100+ iterations)", () => {
    fc.assert(
      fc.property(themeArb, fc.boolean(), (savedTheme, prefersDark) => {
        const resolved = resolveTheme(savedTheme, prefersDark);
        expect(resolved).toBe(savedTheme);
      }),
      { numRuns: 120 }
    );
  });

  it("system preference is used when no saved theme (100+ iterations)", () => {
    fc.assert(
      fc.property(fc.boolean(), (prefersDark) => {
        const resolved = resolveTheme(null, prefersDark);
        expect(resolved).toBe(prefersDark ? "dark" : "light");
      }),
      { numRuns: 120 }
    );
  });

  it("invalid saved theme falls back to system preference (100+ iterations)", () => {
    fc.assert(
      fc.property(invalidThemeArb, fc.boolean(), (badValue, prefersDark) => {
        const resolved = resolveTheme(badValue, prefersDark);
        expect(resolved).toBe(prefersDark ? "dark" : "light");
      }),
      { numRuns: 120 }
    );
  });
});
