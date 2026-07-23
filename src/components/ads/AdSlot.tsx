"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface AdSlotProps {
  position: string;
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string;
  position: { type: string; width?: number | null; height?: number | null };
}

export function AdSlot({ position, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [imgError, setImgError] = useState(false);
  const impressionTracked = useRef(false);

  useEffect(() => {
    async function loadAd() {
      try {
        const res = await fetch(`/api/v1/ads?position=${position}`);
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          const ads: Ad[] = json.data;
          const selected = ads[Math.floor(Math.random() * ads.length)];
          setAd(selected);
          if (!impressionTracked.current) {
            impressionTracked.current = true;
            fetch(`/api/v1/ads/${selected.id}/impression`, { method: "POST" }).catch(() => {});
          }
        }
      } catch {
        // Silently fail for ads
      }
    }
    loadAd();
  }, [position]);

  if (!ad || imgError) {
    return null;
  }

  const handleClick = () => {
    fetch(`/api/v1/ads/${ad.id}/click`, { method: "POST" }).catch(() => {});
  };

  const width = ad.position.width || 728;
  const height = ad.position.height || 90;

  return (
    <div className={className} data-position={position}>
      <a href={ad.target_url} target="_blank" rel="noopener noreferrer sponsored" onClick={handleClick} className="block">
        {ad.image_url ? (
          <Image src={ad.image_url} alt={ad.title} width={width} height={height}
            className="w-full h-auto rounded-lg" unoptimized
            onError={() => setImgError(true)} />
        ) : null}
      </a>
    </div>
  );
}
