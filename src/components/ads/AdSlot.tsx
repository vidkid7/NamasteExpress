"use client";

import { useEffect, useRef, useState } from "react";
import { useHeaderAd } from "@/contexts/AdContext";
import type { PublicAd } from "@/types/ads";

interface AdSlotProps {
  position: string;
  className?: string;
}

function readInitialHeaderAd(): PublicAd | null {
  if (typeof document === "undefined") return null;

  const element = document.getElementById("initial-header-ad");
  if (!element?.textContent) return null;

  try {
    return JSON.parse(element.textContent) as PublicAd | null;
  } catch {
    return null;
  }
}

export function AdSlot({ position, className = "", initialAd }: AdSlotProps & { initialAd?: PublicAd | null }) {
  const headerAd = useHeaderAd();
  const seededAd = initialAd ?? (position === "HEADER" ? headerAd ?? readInitialHeaderAd() : null);
  const [ad, setAd] = useState<PublicAd | null>(seededAd);
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (seededAd) {
      setAd(seededAd);
      if (!impressionTracked.current) {
        impressionTracked.current = true;
        fetch(`/placements/${seededAd.id}/impression`, { method: "POST" }).catch(() => {});
      }
      return;
    }

    async function loadAd() {
      try {
        const res = await fetch(`/placements?position=${position}`);
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          const ads: PublicAd[] = json.data;
          const selected = ads[Math.floor(Math.random() * ads.length)];
          setAd(selected);
          if (!impressionTracked.current) {
            impressionTracked.current = true;
            fetch(`/placements/${selected.id}/impression`, { method: "POST" }).catch(() => {});
          }
        }
      } catch {
        // Silently fail for ads
      }
    }
    loadAd();
  }, [position, seededAd]);

  if (!ad) {
    return null;
  }

  const handleClick = () => {
    fetch(`/placements/${ad.id}/click`, { method: "POST" }).catch(() => {});
  };

  const width = ad.position.width || 728;
  const height = ad.position.height || 90;

  return (
    <div className={className} data-position={position}>
      <a href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick} className="block">
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.title} width={width} height={height}
            className="w-full h-auto rounded-lg" />
        ) : null}
      </a>
    </div>
  );
}
