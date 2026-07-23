"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useRef } from "react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const mn = (ne: string, en: string) => language === "ne" ? ne : en;

  const navItems = [
    {
      href: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: mn("होम", "Home"),
    },
    {
      href: "/#daily-brief",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path d="M5 5h14" strokeLinecap="round" />
          <path d="M5 12h10" strokeLinecap="round" />
          <path d="M5 19h7" strokeLinecap="round" />
          <path d="M18 15l2 2 3-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: mn("ब्रिफ", "Brief"),
    },
    {
      href: "/patro",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: mn("पात्रो", "Patro"),
    },
    {
      href: "/rashifal",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      ),
      label: mn("राशिफल", "Rashifal"),
    },
    {
      action: () => setSearchOpen(true),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
        </svg>
      ),
      label: mn("खोज्नुस्", "Search"),
    },
  ];

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div className="flex-1" onClick={() => setSearchOpen(false)} />
          <div
            className="mx-3 mb-[calc(4.5rem+env(safe-area-inset-bottom))] rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-5 h-5 shrink-0" style={{ color: "var(--muted)" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                  }
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                placeholder={mn("समाचार खोज्नुस्...", "Search news...")}
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: "var(--foreground)" }}
              />
              <button onClick={() => setSearchOpen(false)}
                className="shrink-0 p-1 rounded-lg"
                style={{ color: "var(--muted)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                {mn("लोकप्रिय खोजहरू", "Popular searches")}
              </p>
              {["राजनीति", "खेलकुद", "अर्थ", "प्रविधि"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { window.location.href = `/search?q=${encodeURIComponent(tag)}`; }}
                  className="inline-block mr-2 mb-2 px-3 py-1 rounded-full text-sm"
                  style={{ background: "var(--surface-alt)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item, idx) => {
          const active = item.href ? isActive(item.href) : false;
          const content = (
            <span
              className="flex flex-col items-center gap-0.5 py-2 px-1 min-w-0 transition-all"
              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
            >
              <span className={`transition-transform ${active ? "scale-110" : ""}`}>{item.icon}</span>
              <span className="text-[10px] font-medium leading-none truncate">{item.label}</span>
            </span>
          );
          if (item.action) {
            return (
              <button key={idx} onClick={item.action} className="flex-1 flex justify-center">
                {content}
              </button>
            );
          }
          return (
            <Link key={idx} href={item.href!} className="flex-1 flex justify-center">
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Spacer so content isn't hidden behind the nav */}
      <div className="mobile-bottom-nav-spacer" />
    </>
  );
}
