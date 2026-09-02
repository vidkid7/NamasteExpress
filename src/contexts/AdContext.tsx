"use client";

import { createContext, useContext } from "react";
import type { PublicAd } from "@/types/ads";

const AdContext = createContext<PublicAd | null>(null);

export function AdProvider({
  headerAd,
  children,
}: {
  headerAd: PublicAd | null;
  children: React.ReactNode;
}) {
  return <AdContext.Provider value={headerAd}>{children}</AdContext.Provider>;
}

export function useHeaderAd() {
  return useContext(AdContext);
}
