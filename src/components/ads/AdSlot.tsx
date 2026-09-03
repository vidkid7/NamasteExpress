"use client";

import { useEffect, useRef, useState } from "react";
import { useHeaderAd } from "@/contexts/AdContext";
import type { PublicAd } from "@/types/ads";
import { getAdImageSrc } from "@/lib/ad-image";
import { getAdSizeMaxWidth, normalizeAdSize } from "@/lib/ad-sizes";

const TRACKING_REQUEST_INIT: RequestInit = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  keepalive: true,
};

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
        fetch(`/placements/${seededAd.id}/impression`, TRACKING_REQUEST_INIT).catch(() => {});
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
            fetch(`/placements/${selected.id}/impression`, TRACKING_REQUEST_INIT).catch(() => {});
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
    fetch(`/placements/${ad.id}/click`, TRACKING_REQUEST_INIT).catch(() => {});
  };

  const imageSrc = getAdImageSrc(ad.id, ad.image_url);
  const adSize = normalizeAdSize(ad.ad_size);
  const maxWidth = getAdSizeMaxWidth(adSize, ad.position.width);

  return (
    <div
      className={`ad-slot mx-auto w-full max-w-full p-[2px] ${className}`.trim()}
      data-position={position}
      data-ad-size={adSize}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
    >
      <a href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick} className="block w-full">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={ad.title}
            aria-label={ad.title}
            decoding="async"
            loading={position === "HEADER" ? "eager" : "lazy"}
            className="block w-full max-w-full h-auto rounded-lg object-contain"
            onError={(event) => {
              if (ad.image_url && event.currentTarget.src !== ad.image_url) {
                event.currentTarget.onerror = null;
                event.currentTarget.src = ad.image_url;
              }
            }}
          />
        ) : null}
      </a>
    </div>
  );
}
