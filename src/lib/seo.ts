export function siteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function canonicalUrl(path: string): string {
  const base = siteBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function defaultOpenGraphImage(): string {
  return `${siteBaseUrl()}/icons/logo.jpeg`;
}
