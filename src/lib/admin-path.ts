function configuredAdminSegment() {
  const segment = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH?.trim();
  if (!segment || segment === "admin") return "admin";
  return segment.replace(/^\/+|\/+$/g, "");
}

export function adminPath(path = "") {
  const base = `/${configuredAdminSegment()}`;
  const suffix = path.trim();

  if (!suffix || suffix === "/") return base;
  return `${base}/${suffix.replace(/^\/+/, "")}`;
}

export function internalAdminPath(path = "") {
  const suffix = path.trim();
  if (!suffix || suffix === "/") return "/admin";
  return `/admin/${suffix.replace(/^\/+/, "")}`;
}
