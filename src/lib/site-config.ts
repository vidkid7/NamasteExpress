import type { SiteConfig } from "@/types";
import prisma from "@/lib/prisma";
import { defaultSiteConfig } from "@/lib/site-config-defaults";

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const settings = await prisma.siteSettings.findMany();
    const settingsMap: Record<string, unknown> = {};

    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return { ...defaultSiteConfig, ...settingsMap } as SiteConfig;
  } catch {
    return defaultSiteConfig;
  }
}
