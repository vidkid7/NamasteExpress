"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { SupportedLanguage } from "@/types";
import { adToBS, BS_MONTHS_NE, toNepaliNums } from "@/lib/nepali-date";
import ne from "@/i18n/locales/ne.json";
import en from "@/i18n/locales/en.json";

const translations = { ne, en };

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  /** Translate a key, with optional interpolation: t("hello", { name: "World" }) */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    key in params ? String(params[key]) : `{{${key}}}`
  );
}

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d)]);
}

/** Format a Date as Nepali (BS) date string using proper conversion */
export function formatNepaliDate(date: Date): string {
  try {
    const bs = adToBS(date);
    return `${toNepaliNums(bs.day)} ${BS_MONTHS_NE[bs.month - 1]}, ${toNepaliNums(bs.year)}`;
  } catch {
    return date.toLocaleDateString("ne-NP");
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("ne");

  useEffect(() => {
    const saved = localStorage.getItem("language") as SupportedLanguage;
    if (saved && (saved === "ne" || saved === "en")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = getNestedValue(
        translations[language] as unknown as Record<string, unknown>,
        key
      );
      if (params) return interpolate(value, params);
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
