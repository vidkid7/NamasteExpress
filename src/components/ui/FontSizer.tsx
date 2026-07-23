"use client";

import { useFontSize } from "@/contexts/FontSizeContext";

interface FontSizerProps {
  className?: string;
  /** Variant: 'light' for dark backgrounds (navbar), 'dark' for light backgrounds (admin) */
  variant?: "light" | "dark";
}

export function FontSizer({ className = "", variant = "light" }: FontSizerProps) {
  const { increase, decrease, reset, canIncrease, canDecrease } = useFontSize();

  const btnBase =
    "inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold transition-all select-none";

  const activeStyle =
    variant === "light"
      ? "text-white/90 hover:bg-white/20 hover:text-white border border-white/30"
      : "text-foreground hover:bg-surface-alt border border-border";

  const disabledStyle = "opacity-30 cursor-not-allowed";

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      title="Font size"
      aria-label="Adjust font size"
    >
      <button
        onClick={decrease}
        disabled={!canDecrease}
        className={`${btnBase} ${activeStyle} ${!canDecrease ? disabledStyle : ""}`}
        aria-label="Decrease font size"
        title="Smaller text"
      >
        A<sup style={{ fontSize: "0.6em", lineHeight: 1 }}>-</sup>
      </button>
      <button
        onClick={reset}
        className={`${btnBase} ${activeStyle} text-[10px] px-1 w-auto`}
        aria-label="Reset font size"
        title="Reset text size"
        style={{ minWidth: "1.25rem" }}
      >
        A
      </button>
      <button
        onClick={increase}
        disabled={!canIncrease}
        className={`${btnBase} ${activeStyle} ${!canIncrease ? disabledStyle : ""}`}
        aria-label="Increase font size"
        title="Larger text"
      >
        A<sup style={{ fontSize: "0.6em", lineHeight: 1 }}>+</sup>
      </button>
    </div>
  );
}
