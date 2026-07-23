import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || "admin";
const adminPaths = ["/" + ADMIN_SECRET, "/api/v1/admin"];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_READ_MAX = 300;
const RATE_LIMIT_AUTH_MAX = 10;
const RATE_LIMIT_LOGIN_MAX = 5;
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeHost(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\.$/, "") || "";
}

function addUrlHost(hosts: Set<string>, value: string | null | undefined) {
  if (!value) return;
  try {
    hosts.add(normalizeHost(new URL(value).host));
  } catch {
    // Environment values may be unset or non-URL placeholders locally.
  }
}

function allowedOriginHosts(request: NextRequest) {
  const hosts = new Set<string>();

  hosts.add(normalizeHost(request.nextUrl.host));
  hosts.add(normalizeHost(request.headers.get("host")));
  addUrlHost(hosts, process.env.NEXT_PUBLIC_SITE_URL);
  addUrlHost(hosts, process.env.NEXTAUTH_URL);
  addUrlHost(hosts, process.env.AUTH_URL);

  hosts.delete("");
  return hosts;
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

if (typeof globalThis !== "undefined") {
  const cleanupKey = "__rateLimitCleanup";
  if (!(globalThis as Record<string, unknown>)[cleanupKey]) {
    (globalThis as Record<string, unknown>)[cleanupKey] = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetTime) rateLimitMap.delete(key);
      }
    }, 300_000);
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = normalizeHost(
    request.headers.get("x-forwarded-host")?.split(",")[0] || request.headers.get("host")
  );

  if (process.env.NODE_ENV === "production" && host === "namastexpress.org") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = "www.namastexpress.org";
    canonicalUrl.protocol = "https";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl);
  }

  const response = NextResponse.next();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));

  // Block direct access to /admin — must use custom secret path
  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && ADMIN_SECRET !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    UNSAFE_METHODS.has(request.method)
  ) {
    const origin = request.headers.get("origin");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
      }
      if (!allowedOriginHosts(request).has(normalizeHost(originHost))) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
      }
    }
  }

  if (pathname.startsWith("/api/")) {
    const isCredentialsLogin =
      pathname === "/api/auth/callback/credentials" && request.method === "POST";
    if (pathname.startsWith("/api/auth/") && !isCredentialsLogin) {
      // Let NextAuth handle its own security
    } else {
      const isCustomAuthPath = pathname.startsWith("/api/v1/auth/");
      const limit = isCredentialsLogin
        ? RATE_LIMIT_LOGIN_MAX
        : isCustomAuthPath
        ? RATE_LIMIT_AUTH_MAX
        : request.method === "GET"
          ? RATE_LIMIT_READ_MAX
          : RATE_LIMIT_MAX;
      const rateLimitKey = `${ip}:${request.method}:${pathname}`;

      if (isRateLimited(rateLimitKey, limit)) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  const scriptSrc = ["'self'", "'unsafe-inline'", "https://accounts.google.com"];
  if (process.env.NODE_ENV !== "production") {
    scriptSrc.push("'unsafe-eval'");
  }
  const cspDirectives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://accounts.google.com https://wttr.in",
    "frame-src https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "media-src 'self' blob: data: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  if (process.env.NODE_ENV === "production") {
    cspDirectives.push("upgrade-insecure-requests");
  }
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  if (isAdminPath || pathname.startsWith("/api/auth/") || pathname.startsWith("/api/v1/auth/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  if (isAdminPath) {
    const adminIpWhitelist = (process.env.ADMIN_IP_WHITELIST || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (adminIpWhitelist.length > 0 && !adminIpWhitelist.includes(ip)) {
      return pathname.startsWith("/api/")
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/", request.url));
    }

    const token =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rewrite secret admin path to internal /admin routes (after auth check)
  if (ADMIN_SECRET !== "admin" && pathname.startsWith("/" + ADMIN_SECRET)) {
    const rewritten = pathname.replace("/" + ADMIN_SECRET, "/admin") || "/admin";
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = rewritten;
    return NextResponse.rewrite(newUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json).*)",
  ],
};
