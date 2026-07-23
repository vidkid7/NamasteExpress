"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  position: string;
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string;
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [imgError, setImgError] = useState(false);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAd() {
      try {
        const res = await fetch(`/api/v1/ads?position=${position}`, { signal: controller.signal });
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
        // Silently fail - ads are non-critical
      }
    }
    loadAd();

    return () => controller.abort();
  }, [position]);

  if (!ad || imgError) return null;

  function handleClick() {
    if (ad) {
      fetch(`/api/v1/ads/${ad.id}/click`, { method: "POST" }).catch(() => {});
    }
  }

  return (
    <div className={`ad-banner text-center ${className}`}>
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
      >
        {ad.image_url ? (
          <Image
            src={ad.image_url}
            alt={ad.title}
            width={728}
            height={90}
            className="w-full h-auto rounded"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : null}
      </a>
    </div>
  );
}
