"use client";

import { useRef } from "react";
import { Clapperboard, ChevronLeft, ChevronRight } from "lucide-react";
import { ReelCard } from "./ReelCard";

interface Reel {
  slug: string;
  title: string;
  thumbnail?: string | null;
  view_count: number;
}

interface ReelCarouselProps {
  reels: Reel[];
  title?: string;
}

export function ReelCarousel({ reels, title = "OK Reels" }: ReelCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (!reels.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold inline-flex items-center gap-2" style={{ color: "var(--foreground)" }}>
          <Clapperboard className="h-5 w-5" /> {title}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {reels.map((reel) => (
          <div key={reel.slug} className="w-44 shrink-0 snap-start">
            <ReelCard
              slug={reel.slug}
              title={reel.title}
              thumbnail={reel.thumbnail}
              viewCount={reel.view_count}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
