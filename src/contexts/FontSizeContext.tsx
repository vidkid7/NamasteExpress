"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FONT_SIZES = [14, 16, 18, 20, 22] as const;
const DEFAULT_INDEX = 1; // 16px
const STORAGE_KEY = "site-font-size-index";

interface FontSizeContextValue {
  fontSize: number;
  canIncrease: boolean;
  canDecrease: boolean;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const FontSizeContext = createContext<FontSizeContextValue>({
  fontSize: FONT_SIZES[DEFAULT_INDEX],
  canIncrease: true,
  canDecrease: true,
  increase: () => {},
  decrease: () => {},
  reset: () => {},
});

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(DEFAULT_INDEX);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < FONT_SIZES.length) {
        setIndex(parsed);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--base-font-size",
      `${FONT_SIZES[index]}px`
    );
    localStorage.setItem(STORAGE_KEY, String(index));
  }, [index]);

  const increase = () => setIndex((i) => Math.min(i + 1, FONT_SIZES.length - 1));
  const decrease = () => setIndex((i) => Math.max(i - 1, 0));
  const reset = () => setIndex(DEFAULT_INDEX);

  return (
    <FontSizeContext.Provider
      value={{
        fontSize: FONT_SIZES[index],
        canIncrease: index < FONT_SIZES.length - 1,
        canDecrease: index > 0,
        increase,
        decrease,
        reset,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
