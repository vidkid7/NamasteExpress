const rateLimitStoreKey = "__namasteExpressRateLimitStore";

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

type GlobalWithRateLimitStore = typeof globalThis & {
  [rateLimitStoreKey]?: Map<string, RateLimitEntry>;
};

function getRateLimitStore() {
  const globalStore = globalThis as GlobalWithRateLimitStore;
  if (!globalStore[rateLimitStoreKey]) {
    globalStore[rateLimitStoreKey] = new Map<string, RateLimitEntry>();
  }
  return globalStore[rateLimitStoreKey];
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const store = getRateLimitStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSafeLocalRedirect(value: string | null | undefined) {
  if (!value) return false;
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

export function absoluteSiteUrl(request: Request, path: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const base = configured && /^https?:\/\//i.test(configured)
    ? configured
    : new URL(request.url).origin;
  return new URL(path, base).toString();
}

export function hasControlCharacters(value: string) {
  return /[\r\n\0]/.test(value);
}

export function isKnownSeedPassword(password: string) {
  const seedPasswords = [
    process.env.SEED_ADMIN_PASSWORD,
    process.env.SEED_EDITOR_PASSWORD,
    process.env.SEED_AUTHOR_PASSWORD,
  ].filter(Boolean);

  let result = 0;
  for (const seed of seedPasswords) {
    if (seed && seed.length === password.length) {
      for (let i = 0; i < seed.length; i++) {
        result |= seed.charCodeAt(i) ^ password.charCodeAt(i);
      }
    } else {
      result |= 1;
    }
  }
  if (seedPasswords.length === 0) result |= 1;
  return result === 0;
}

export function isPrivateHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(lower)) {
    const [a, b] = lower.split(".").map((part) => Number(part));
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }

  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd");
}
