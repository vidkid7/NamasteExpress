import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("Proxy origin validation", () => {
  it("redirects apex production host to www before auth cookies are created", () => {
    vi.stubEnv("NODE_ENV", "production");
    const request = new NextRequest(
      new Request("https://namastexpress.org:8080/auth/login?callbackUrl=%2Fprofile", {
        headers: {
          host: "namastexpress.org",
          "x-forwarded-host": "namastexpress.org",
        },
      })
    );

    const response = proxy(request);
    vi.unstubAllEnvs();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://www.namastexpress.org/auth/login?callbackUrl=%2Fprofile"
    );
  });

  it("allows the configured public origin behind a trusted reverse proxy", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.namastexpress.org");
    const request = new NextRequest(
      new Request("https://internal-app.example/api/v1/articles", {
        method: "POST",
        headers: {
          origin: "https://www.namastexpress.org",
          "x-forwarded-host": "www.namastexpress.org",
        },
      })
    );

    const response = proxy(request);
    vi.unstubAllEnvs();

    expect(response.status).not.toBe(403);
  });

  it("rejects unsafe API requests from unknown origins", () => {
    const request = new NextRequest(
      new Request("https://internal-app.example/api/v1/articles", {
        method: "POST",
        headers: {
          origin: "https://attacker.example",
          "x-forwarded-host": "www.namastexpress.org",
        },
      })
    );

    const response = proxy(request);

    expect(response.status).toBe(403);
  });
});
