"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useLanguage, toNepaliDigits } from "@/contexts/LanguageContext";
import { publicContentPath } from "@/lib/public-articles";

interface Reel {
  id: string;
  title: string;
  title_en?: string | null;
  slug: string;
  thumbnail?: string | null;
  view_count: number;
}

export function ReelsCarousel({ reels }: { reels: Reel[] }) {
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!reels.length) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="rounded-3xl px-4 py-5 text-white shadow-xl sm:px-5" style={{ backgroundColor: "var(--nav-bg)" }}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent">
            {language === "ne" ? "हेर्नुहोस्" : "Watch"}
          </p>
          <h2 className="mt-1 text-xl font-black" style={{ fontFamily: "var(--font-nepali-serif)" }}>{language === "ne" ? "OK रिल्स" : "OK Reels"}</h2>
        </div>
        <Link href="/reels" className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-950">
          {language === "ne" ? "सबै" : "All"}
        </Link>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-slate-950 opacity-0 shadow-md transition-opacity group-hover:opacity-100 md:flex"
          aria-label="Scroll left"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div ref={scrollRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-hide sm:gap-4">
          {reels.map((reel) => {
            const title = language === "en" && reel.title_en ? reel.title_en : reel.title;
            return (
              <Link
                key={reel.id}
                href={publicContentPath("/reels", reel.slug)}
                className="group/reel w-40 shrink-0 snap-start sm:w-48"
              >
                <div className="relative h-72 w-40 overflow-hidden rounded-2xl border border-border shadow-lg sm:h-80 sm:w-48" style={{ backgroundColor: "var(--surface)" }}>
                  {reel.thumbnail ? (
                    <Image src={reel.thumbnail} alt={title} fill className="object-cover" sizes="192px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-red-600 to-red-900">
                      <svg className="h-12 w-12 text-white/80" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-red-600 shadow-md">
                    <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div className="absolute bottom-0 p-3 text-white">
                    <p className="line-clamp-3 text-sm font-extrabold leading-[1.55]" style={{ fontFamily: "var(--font-nepali-serif)" }}>{title}</p>
                    <p className="text-[10px] mt-1 opacity-70">▶ {toNepaliDigits(reel.view_count)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-slate-950 opacity-0 shadow-md transition-opacity group-hover:opacity-100 md:flex"
          aria-label="Scroll right"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>
  );
}
