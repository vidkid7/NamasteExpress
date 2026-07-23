"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  /**
   * If true, the loader acts as a fixed splash screen that auto-hides once the
   * application has finished hydrating. If false, it renders as a plain centered
   * loader suitable for `loading.tsx`.
   */
  splash?: boolean;
  /**
   * Minimum time (ms) the splash screen stays visible so users aren't greeted by a flash.
   */
  minDisplayMs?: number;
  /** Optional message shown under the brand name. */
  message?: string;
}

export function LoadingScreen({
  splash = false,
  minDisplayMs = 0,
  message = "विश्वसनीय समाचार सेवा",
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!splash) return;
    const hideTimer = setTimeout(() => setVisible(false), minDisplayMs);
    return () => clearTimeout(hideTimer);
  }, [splash, minDisplayMs]);

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style={{ background: "var(--background)" }}>
      {/* Soft radial glow behind the logo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[90px] animate-pulse" />
      </div>

      {/* Logo with pulse + ring animation */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6 h-28 w-28 animate-logo-pulse md:h-36 md:w-36">
          <div className="absolute inset-0 rounded-2xl bg-[#c62828]/30 blur-md animate-logo-ring" />
          <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-white p-3 shadow-2xl">
            <Image
              src="/icons/logo.jpeg"
              alt="नमस्ते एक्सप्रेस"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Brand name with staggered letter reveal effect */}
        <h1
          className="animate-title-fade z-10 text-center text-2xl font-bold md:text-3xl"
          style={{ fontFamily: "var(--font-nepali-serif)", color: "var(--foreground)" }}
        >
          नमस्ते एक्सप्रेस
        </h1>

        <p className="animate-tagline-fade z-10 mt-2 text-sm md:text-base" style={{ color: "var(--muted)" }}>
          {message}
        </p>

        {/* Animated spinner */}
        <div className="mt-8 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#c62828] animate-dot-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-[#c62828] animate-dot-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-[#c62828] animate-dot-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );

  if (!splash) return content;

  return (
    <div
      className={`transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!visible}
    >
      {content}
    </div>
  );
}
