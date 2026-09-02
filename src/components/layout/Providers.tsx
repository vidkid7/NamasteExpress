"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OptionalSessionProvider } from "@/components/layout/OptionalSessionProvider";
import { AdProvider } from "@/contexts/AdContext";
import type { PublicAd } from "@/types/ads";

export function Providers({ children, initialHeaderAd = null }: { children: React.ReactNode; initialHeaderAd?: PublicAd | null }) {
  return (
    <OptionalSessionProvider>
      <ThemeProvider>
        <FontSizeProvider>
          <LanguageProvider>
            <SiteConfigProvider>
              <AdProvider headerAd={initialHeaderAd}>
                <OfflineIndicator />
                {children}
                <MobileBottomNav />
                <CookieConsent />
              </AdProvider>
            </SiteConfigProvider>
          </LanguageProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </OptionalSessionProvider>
  );
}
