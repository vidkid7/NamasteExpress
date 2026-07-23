"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  advertising: false,
};

export function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookieConsent");
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    try {
      localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    } catch {
      // localStorage not available
    }
    setVisible(false);
    setShowPreferences(false);
  }, []);

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, advertising: true });
  };

  const rejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, advertising: false });
  };

  const savePreferences = () => {
    saveConsent({ ...preferences, essential: true });
  };

  if (!visible) return null;

  return (
    <>
      {/* Main banner — compact on mobile */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal={showPreferences}
        className="cookie-consent-shell fixed inset-x-0 z-50 p-2 sm:p-4"
      >
        <div className="mx-auto max-w-4xl card p-3 sm:p-5 shadow-lg max-h-[min(58vh,22rem)] overflow-y-auto">
          <p className="text-xs sm:text-sm text-muted mb-3 leading-relaxed">
            हामी तपाईंको अनुभव सुधार गर्न कुकीहरू प्रयोग गर्छौं।{" "}
            We use cookies to improve your experience.{" "}
            <a
              href="/cookie-policy"
              className="text-accent underline hover:no-underline"
            >
              {t("footer.cookiePolicy")}
            </a>
          </p>

          {/* Compact actions so the banner does not cover the mobile nav. */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button
              onClick={acceptAll}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-2 py-2 text-[11px] font-semibold leading-tight text-white transition-colors hover:bg-accent-hover sm:px-4 sm:text-sm"
              autoFocus
            >
              <span className="sm:hidden">Accept</span>
              <span className="hidden sm:inline">Accept All</span>
            </button>
            <button
              onClick={rejectNonEssential}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-2 py-2 text-[11px] font-semibold leading-tight text-foreground transition-colors hover:bg-surface-alt sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Reject</span>
              <span className="hidden sm:inline">Reject Non-Essential</span>
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-2 py-2 text-[11px] font-semibold leading-tight text-foreground transition-colors hover:bg-surface-alt sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Manage</span>
              <span className="hidden sm:inline">Manage Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preferences modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-label="Cookie preferences"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreferences(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowPreferences(false);
          }}
        >
          <div className="card p-4 sm:p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-bold">
              Cookie Preferences / कुकी प्राथमिकताहरू
            </h2>

            {/* Essential - always on */}
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Essential / आवश्यक</p>
                <p className="text-xs text-muted">
                  Required for the site to function
                </p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                className="w-5 h-5 accent-accent"
                aria-label="Essential cookies (always enabled)"
              />
            </label>

            {/* Analytics */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">Analytics / विश्लेषण</p>
                <p className="text-xs text-muted">
                  Helps us understand site usage
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    analytics: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-accent"
                aria-label="Analytics cookies"
              />
            </label>

            {/* Advertising */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">
                  Advertising / विज्ञापन
                </p>
                <p className="text-xs text-muted">
                  Used for relevant advertisements
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.advertising}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    advertising: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-accent"
                aria-label="Advertising cookies"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={savePreferences}
                className="btn-primary text-sm flex-1"
              >
                {t("common.save")}
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="btn-secondary text-sm flex-1"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
