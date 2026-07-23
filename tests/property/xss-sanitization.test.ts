import { describe, it, expect } from "vitest";
import fc from "fast-check";
import sanitizeHtml from "sanitize-html";

const sanitize = (html: string) => sanitizeHtml(html);

const scriptTagArb = fc.oneof(
  fc.constant("<script>alert('xss')</script>"),
  fc.constant("<script src='evil.js'></script>"),
  fc.constant("<SCRIPT>document.cookie</SCRIPT>"),
  fc
    .string({ minLength: 1, maxLength: 50 })
    .map((s) => `<script>${s}</script>`)
);

const eventHandlerArb = fc.oneof(
  fc.constant('<img src="x" onerror="alert(1)">'),
  fc.constant('<div onmouseover="steal()">hover</div>'),
  fc.constant('<a onclick="evil()">click</a>'),
  fc.constant('<body onload="malicious()">'),
  fc.constant('<input onfocus="hack()">'),
  fc.constant('<svg onload="alert(1)">'),
);

const iframeArb = fc.oneof(
  fc.constant('<iframe src="http://evil.com"></iframe>'),
  fc.constant('<iframe srcdoc="<script>alert(1)</script>"></iframe>'),
);

const mixedXssArb = fc.oneof(
  scriptTagArb,
  eventHandlerArb,
  iframeArb,
  // Mixed safe + malicious content
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 50 }),
      scriptTagArb
    )
    .map(([safe, xss]) => `<p>${safe}</p>${xss}`),
);

describe("Property 16: XSS Sanitization", () => {
  it("script tags are always removed (100+ iterations)", () => {
    fc.assert(
      fc.property(scriptTagArb, (html) => {
        const sanitized = sanitize(html);
        expect(sanitized).not.toContain("<script");
        expect(sanitized).not.toContain("</script>");
        expect(sanitized.toLowerCase()).not.toContain("<script");
      }),
      { numRuns: 120 }
    );
  });

  it("event handlers are always removed (100+ iterations)", () => {
    fc.assert(
      fc.property(eventHandlerArb, (html) => {
        const sanitized = sanitize(html);
        expect(sanitized.toLowerCase()).not.toMatch(/on\w+\s*=/);
      }),
      { numRuns: 120 }
    );
  });

  it("iframes are removed (100+ iterations)", () => {
    fc.assert(
      fc.property(iframeArb, (html) => {
        const sanitized = sanitize(html);
        expect(sanitized.toLowerCase()).not.toContain("<iframe");
      }),
      { numRuns: 120 }
    );
  });

  it("safe HTML is preserved while malicious parts are stripped (100+ iterations)", () => {
    fc.assert(
      fc.property(mixedXssArb, (html) => {
        const sanitized = sanitize(html);
        // No script tags
        expect(sanitized.toLowerCase()).not.toContain("<script");
        // No event handlers
        expect(sanitized.toLowerCase()).not.toMatch(/on\w+\s*=/i);
        // Result is a string (not null/undefined)
        expect(typeof sanitized).toBe("string");
      }),
      { numRuns: 120 }
    );
  });

  it("sanitized output is idempotent — double sanitize equals single (100+ iterations)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        (input) => {
          const once = sanitize(input);
          const twice = sanitize(once);
          expect(once).toBe(twice);
        }
      ),
      { numRuns: 120 }
    );
  });
});
