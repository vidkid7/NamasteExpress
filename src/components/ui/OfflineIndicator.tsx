"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function OfflineIndicator() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    // Check initial state
    if (!navigator.onLine) setIsOffline(true);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[100] bg-yellow-500 text-black text-sm py-2 px-4 flex items-center justify-between"
    >
      <span className="inline-flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {t("common.offline")}</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 font-bold hover:opacity-70"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
