"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SiteConfig } from "@/types";
import { defaultSiteConfig } from "@/lib/site-config-defaults";

interface SiteConfigContextType {
  config: SiteConfig;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultSiteConfig,
  loading: true,
  refresh: async () => {},
});

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/v1/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setConfig({ ...defaultSiteConfig, ...data.data });
        }
      }
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, refresh }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
