"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatNepaliDate } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { useRouter } from "next/navigation";
import { FontSizer } from "@/components/ui/FontSizer";
import { AdSlot } from "@/components/ads/AdSlot";
import { adminPath } from "@/lib/admin-path";
import { publicArticlePath } from "@/lib/public-articles";
import { User as UserIcon, LogIn, UserPlus } from "lucide-react";

/* ─── Navigation Data ─────────────────────────────────────────────────── */

const MAIN_NAV = [
  { key: "home", href: "/" },
  { key: "samachar", href: "/categories/samachar" },
  { key: "business", href: "/categories/arthatantra" },
  { key: "lifestyle", href: "/categories/feature" },
  { key: "entertainment", href: "/categories/bichitra" },
  { key: "bichar", href: "/categories/bichar" },
  { key: "khelkud", href: "/categories/khelkud" },
];

const MORE_NAV = [
  { key: "rajniti", href: "/categories/rajniti" },
  { key: "antarvaarta", href: "/categories/antarvaarta" },
  { key: "coverStory", href: "/categories/cover-story" },
  { key: "saptaahanta", href: "/categories/saptaahanta" },
  { key: "antarrashtriya", href: "/categories/antarrashtriya" },
  { key: "sahitya", href: "/categories/sahitya" },
  { key: "prabidhi", href: "/categories/prabidhi" },
  { key: "video", href: "/categories/video" },
  { key: "photoGallery", href: "/categories/photo-gallery" },
];

const SPECIAL_NAV = [
  { key: "patro", href: "/patro", color: "#c30000" },
  { key: "shareMarket", href: "/share-market", color: "#1e40af" },
  { key: "horoscope", href: "/rashifal", color: "#7c3aed" },
  { key: "health", href: "/categories/swasthya", color: "#15803d" },
];

// Sidebar items with icon paths and colors
const SIDEBAR_ITEMS = [
  { key: "samachar", href: "/categories/samachar", color: "#1e40af", d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
  { key: "business", href: "/categories/arthatantra", color: "#15803d", d: "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" },
  { key: "khelkud", href: "/categories/khelkud", color: "#ea580c", d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 4.3l1.35-.95c1.82.56 3.37 1.76 4.38 3.34l-.39 1.34-1.35.46L13 8.35V6.3zm-3.35-.95L11 6.3v2.05L7.01 10.5l-1.35-.46-.39-1.34c1.01-1.58 2.56-2.78 4.38-3.35zM7.08 17.11l-1.14.1C4.73 15.81 4 13.99 4 12c0-.12.01-.23.02-.35l1.02-.71 1.42.49L8.58 16l-1.5 1.11zm3.68 1.76c-.61-.11-1.19-.31-1.74-.57l.08-1.32 1.31-.97h3.18l1.31.97.08 1.32c-.55.26-1.13.46-1.74.57L12 17.73l-.24 1.14zm6.1-.87l-1.14-.1L14.42 16l2.12-4.57 1.42-.49 1.02.71c.01.12.02.23.02.35 0 1.99-.73 3.81-1.94 5.21z" },
  { key: "bichar", href: "/categories/bichar", color: "#b45309", d: "M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" },
  { key: "lifestyle", href: "/categories/feature", color: "#0891b2", d: "M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67C7.9 20.87 9.95 21.66 12 21.66s4.1-.79 5.66-2.35C19.22 17.75 20 15.64 20 13.64S19.22 9.56 17.66 8z" },
  { key: "entertainment", href: "/categories/bichitra", color: "#7c3aed", d: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" },
  { key: "rajniti", href: "/categories/rajniti", color: "#c30000", d: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" },
  { key: "antarvaarta", href: "/categories/antarvaarta", color: "#1d4ed8", d: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" },
  { key: "antarrashtriya", href: "/categories/antarrashtriya", color: "#4c1d95", d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" },
  { key: "sahitya", href: "/categories/sahitya", color: "#9a3412", d: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" },
  { key: "prabidhi", href: "/categories/prabidhi", color: "#0e7490", d: "M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14zM6 13h5v4H6zm6-6h4v3h-4zM6 7h5v5H6zm6 4h4v6h-4z" },
  { key: "saptaahanta", href: "/categories/saptaahanta", color: "#3f6212", d: "M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" },
  { key: "shareMarket", href: "/share-market", color: "#1e40af", d: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z", isNew: true },
  { key: "health", href: "/categories/swasthya", color: "#15803d", d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", isNew: true },
  { key: "patro", href: "/patro", color: "#c30000", d: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z", isNew: true },
  { key: "horoscope", href: "/rashifal", color: "#7c3aed", d: "M12 3L1 9l4 2.18V17h2v-4.82L9 13.4V17h2v-3l1-.54 1 .54V17h2v-3.6l2-1.22V11.18L22 9 12 3zm0 2.33l6.13 3.34L12 11.67 5.87 8.67 12 5.33z", isNew: true },
  { key: "finance", href: "/finance", color: "#14532d", d: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z", isNew: false },
];

/* ─── Social Icons ────────────────────────────────────────────────────── */

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
}
function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/></svg>
  );
}
function YouTubeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z"/></svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
  );
}
function TikTokIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  );
}

/* ─── Category Icon ───────────────────────────────────────────────────── */

function CatIcon({ d, color }: { d: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: 30, height: 30, background: color + "15" }}
    >
      <svg viewBox="0 0 24 24" fill={color} style={{ width: 16, height: 16 }}>
        <path d={d} />
      </svg>
    </span>
  );
}

/* ─── Main Header Component ───────────────────────────────────────────── */

interface TrendingTopic {
  title: string;
  slug: string;
  image?: string;
}

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { config } = useSiteConfig();
  const { data: session } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuPanelRef = useRef<HTMLDivElement>(null);
  const [userMenuPos, setUserMenuPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => { setToday(new Date()); }, []);
  useEffect(() => { setMounted(true); }, []);

  // Hide logo bar on scroll
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch trending articles for the trending bar
  useEffect(() => {
    fetch("/api/v1/articles?pageSize=8")
      .then((r) => r.json())
      .then((resp) => {
        const articles = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
        setTrendingTopics(
          articles.slice(0, 8).map((a: Record<string, string>) => ({
            title: language === "en" ? (a.title_en || a.title) : a.title,
            slug: a.slug,
            image: a.featured_image || "",
          }))
        );
      })
      .catch(() => {});
  }, [language]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        (!userMenuPanelRef.current || !userMenuPanelRef.current.contains(e.target as Node))
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function toggleUserMenu() {
    if (!userMenuOpen && userBtnRef.current) {
      const r = userBtnRef.current.getBoundingClientRect();
      setUserMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
    }
    setUserMenuOpen((v) => !v);
  }

  function handleLogout() {
    setUserMenuOpen(false);
    setSidebarOpen(false);
    // redirect:false avoids NextAuth using NEXTAUTH_URL (production) for the
    // redirect; navigate to the current origin instead so it works locally too.
    signOut({ redirect: false }).then(() => {
      window.location.href = "/";
    });
  }

  const siteName = language === "en" ? config.site_name.en : config.site_name.ne;
  const isAdmin = session?.user?.role && ["ADMIN", "EDITOR", "AUTHOR"].includes(session.user.role);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSidebarOpen(false);
    }
  }

  return (
    <>
    <header className="sticky top-0 z-50" style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(14px) saturate(180%)", WebkitBackdropFilter: "blur(14px) saturate(180%)" }}>

      {/* ══════════ TIER 1: Logo Bar — clean white, hidden on scroll ══════════ */}
      <div
        className="border-b border-border overflow-hidden transition-all duration-300 hidden md:block"
        style={{ maxHeight: scrolled ? 0 : 120, opacity: scrolled ? 0 : 1 }}
      >
        {/* Thin accent rule — brand red top border */}
        <div style={{ height: 3, background: "var(--accent)" }} />
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo + Site Name + Date */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* Logo image */}
            {config.site_logo && (
              <div className="shrink-0">
                <Image
                  src={config.site_logo}
                  alt={siteName}
                  width={90}
                  height={90}
                  className="object-contain rounded-lg"
                  style={{ maxHeight: 78, width: "auto", height: "auto" }}
                  priority
                  unoptimized
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            {/* Site name + date */}
            <div className="flex flex-col justify-center min-w-0">
              <span
                className="font-bold tracking-tight block"
                style={{
                  fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
                  lineHeight: 1.2,
                  paddingTop: "0.1em",
                  paddingBottom: "0.05em",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-nepali-serif)",
                }}
              >
                {siteName}
              </span>
              <span className="hidden sm:flex items-center gap-2 text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-latin)" }}>
                <span className="inline-block w-3 h-px" style={{ background: "var(--accent)" }} />
                {today
                  ? language === "ne"
                    ? formatNepaliDate(today)
                    : today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                  : "\u00A0"}
              </span>
            </div>
          </Link>

          {/* Banner Ad — hidden automatically when no ad is available */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xl">
            <AdSlot position="HEADER" className="w-full" />
          </div>

          {/* Social + Weather + User */}
          <div className="hidden lg:flex items-center gap-1.5">
            {config.social_facebook && <a href={config.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><FacebookIcon /></a>}
            {config.social_twitter && <a href={config.social_twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-1.5 rounded-full hover:bg-surface-alt transition-colors text-foreground"><XIcon /></a>}
            {config.social_youtube && <a href={config.social_youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors"><YouTubeIcon /></a>}
            {config.social_instagram && <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/30 text-pink-600 transition-colors"><InstagramIcon /></a>}
            {config.social_tiktok && <a href={config.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-1.5 rounded-full hover:bg-surface-alt transition-colors text-foreground"><TikTokIcon /></a>}
            <div className="ml-2 hidden xl:block">
              <WeatherWidget />
            </div>

            {/* User / Admin menu */}
            {session?.user && (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  ref={userBtnRef}
                  onClick={toggleUserMenu}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border hover:bg-surface-alt transition-colors text-xs font-medium"
                >
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                  </span>
                  <span className="hidden xl:inline max-w-[8rem] truncate">{session.user.name || session.user.email}</span>
                  <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            )}

            {/* Logged-out: Sign in / Sign up (desktop) */}
            {!session?.user && (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-surface-alt transition-colors whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t("common.login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors whitespace-nowrap"
                  style={{ background: "var(--accent)" }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {t("common.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ TIER 2: Clean Navigation Bar (white bg, red accent) ══════════ */}
      <div
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 flex items-center justify-between min-h-[68px] py-1.5">

          {/* Compact logo — always visible on mobile, scroll-based on md+ */}
          <Link
            href="/"
            className={`items-center gap-2 shrink-0 mr-3 transition-all duration-300 ${
              scrolled ? "flex opacity-100" : "flex md:hidden opacity-100 md:opacity-0"
            }`}
          >
            {config.site_logo && (
              <div className="relative rounded-lg overflow-hidden ring-1 ring-border bg-white shrink-0" style={{ width: 56, height: 56 }}>
                <Image
                  src={config.site_logo}
                  alt={config.site_name?.ne || "Logo"}
                  fill
                  sizes="56px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <span
              className="font-bold whitespace-nowrap leading-tight"
              style={{
                fontSize: "0.95rem",
                color: "var(--foreground)",
              }}
            >
              {siteName}
            </span>
          </Link>

          {/* Main nav — clean minimal with red underline */}
          <nav className="hidden lg:flex items-center gap-0" aria-label="Main navigation">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="nav-link px-3 py-3 font-semibold text-sm whitespace-nowrap"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}

            {/* "More" dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}
                className="px-3 py-3 font-semibold text-sm text-nav-text hover:text-accent transition-colors whitespace-nowrap flex items-center gap-1"
              >
                {t("nav.more")}
                <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {moreOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-xl shadow-xl py-1.5 z-50 border animate-slideDown bg-surface border-border">
                  {MORE_NAV.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface-alt hover:text-accent transition-colors"
                      onClick={() => setMoreOpen(false)}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Special nav (desktop) — clean monochrome pills with brand color accents */}
            <div className="hidden xl:flex items-center gap-1.5">
              {SPECIAL_NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-1 px-2.5 py-1.5 font-semibold text-xs rounded-md transition-all hover:bg-surface-alt whitespace-nowrap border border-transparent hover:border-border"
                  style={{ color: item.color }}
                >
                  {item.key === "patro" && <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>}
                  {item.key === "shareMarket" && <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>}
                  {item.key === "health" && <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>

            <div className="w-px h-5 bg-border hidden lg:block" />

            {/* Language */}
            <button
              onClick={() => setLanguage(language === "ne" ? "en" : "ne")}
              className="px-2.5 py-1 text-xs font-bold text-foreground border border-border rounded-md hover:bg-surface-alt transition-colors"
              aria-label={t("common.language")}
            >
              {language === "ne" ? "EN" : "NE"}
            </button>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-surface-alt text-muted-foreground hover:text-foreground transition-colors"
              aria-label={theme === "light" ? t("common.darkMode") : t("common.lightMode")}
            >
              {theme === "light" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>

            {/* Font Sizer */}
            <FontSizer variant="dark" className="hidden sm:flex" />

            <div className="w-px h-5 bg-border hidden sm:block" />

            {/* Account (mobile/tablet) — full buttons appear on lg+ in the top bar */}
            <Link
              href={session?.user ? "/profile" : "/auth/login"}
              className="lg:hidden flex items-center p-2 rounded-md hover:bg-surface-alt text-foreground transition-colors"
              aria-label={session?.user ? t("common.profile") : t("common.login")}
            >
              {session?.user ? (
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                  {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                </span>
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-surface-alt text-foreground transition-colors"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ TIER 3: Trending Topics + Search (subtle gray bg) ══════════ */}
      <div className="border-b border-border" style={{ background: "var(--surface-alt)" }}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 flex items-center gap-3 min-h-[42px] py-1.5">
          {/* Trending label */}
          <span className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: "var(--accent)" }}>
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            <span className="hidden xs:inline">{t("common.trending")}</span>
          </span>

          {/* Trending topics marquee auto-scroll */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {trendingTopics.length > 0 ? (
              <div
                className="flex items-center gap-4 animate-marquee"
                style={{ width: "max-content" }}
                onMouseEnter={e => (e.currentTarget.style.animationPlayState = "paused")}
                onMouseLeave={e => (e.currentTarget.style.animationPlayState = "running")}
              >
                {/* Render items twice for seamless loop (marquee moves -50%) */}
                {[...trendingTopics, ...trendingTopics].map((topic, i) => (
                  <Link key={i} href={publicArticlePath(topic.slug)} className="flex items-center gap-2 shrink-0 group">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                      {topic.image ? (
                        <Image src={topic.image} alt="" fill sizes="24px" className="object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center bg-accent/10 text-accent">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M4 4h14a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-1.5 1.5H5a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Zm1 13a1 1 0 0 0 1 1h12V6H4v11a1 1 0 0 0 1 1Zm2-9h8v2H7V8Zm0 4h8v2H7v-2Z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted group-hover:text-accent transition-colors whitespace-nowrap max-w-[140px] truncate">
                      {topic.title}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5 shrink-0 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center shrink-0">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.searchKeywords")}
                className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <button type="submit" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>

    {/* ══════════ USER MENU DROPDOWN (portal — escapes header overflow clip) ══════════ */}
    {mounted && userMenuOpen && session?.user && userMenuPos && createPortal(
      <div
        ref={userMenuPanelRef}
        className="fixed w-48 rounded-xl shadow-xl py-1.5 z-[300] border animate-slideDown bg-surface border-border"
        style={{ top: userMenuPos.top, right: userMenuPos.right }}
      >
        <Link href="/profile" className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface-alt" onClick={() => setUserMenuOpen(false)}>
          {t("common.profile")}
        </Link>
        {isAdmin && (
          <Link href={adminPath()} className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface-alt font-medium" style={{ color: "var(--accent)" }} onClick={() => setUserMenuOpen(false)}>
            {language === "ne" ? "एडमिन प्यानल" : "Admin Panel"}
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-alt"
        >
          {t("common.logout") || (language === "ne" ? "लगआउट" : "Logout")}
        </button>
      </div>,
      document.body
    )}

    {/* ══════════ SIDEBAR DRAWER ══════════ */}
    {/* Sidebar rendered at document.body level */}
    {mounted && sidebarOpen && createPortal(
        <div
          className="fixed inset-0 z-[200]"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setSidebarOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <nav
            className="absolute top-0 right-0 w-80 max-w-[90vw] h-full shadow-2xl flex flex-col bg-surface animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0" style={{ background: "var(--accent)" }}>
              <span className="font-bold text-white">{siteName}</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-white/20 text-white" aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Mobile search */}
            <div className="px-4 py-3 border-b border-border sm:hidden">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.searchKeywords")}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-surface-alt text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile main nav (lg:hidden) */}
            <div className="lg:hidden border-b border-border py-1">
              {MAIN_NAV.map((item) => (
                <Link key={item.key} href={item.href} className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-alt hover:text-accent" onClick={() => setSidebarOpen(false)}>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>

            {/* Category list with icons */}
            <div className="flex-1 overflow-y-auto py-2">
              {SIDEBAR_ITEMS.map((item, idx) => (
                <Link
                  key={`${item.key}-${idx}`}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-alt transition-colors group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <CatIcon d={item.d} color={item.color} />
                  <span className="text-sm font-medium text-foreground group-hover:text-accent flex-1">
                    {t(`nav.${item.key}`)}
                  </span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">NEW</span>
                  )}
                </Link>
              ))}
            </div>

            {/* Finance shortcuts */}
            <div className="border-t border-border px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                <span className="text-xs font-bold text-accent">
                  {language === "ne" ? "बजार र वित्त" : "Markets and finance"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/share-market"
                  className="rounded-lg bg-surface-alt px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-border"
                  onClick={() => setSidebarOpen(false)}
                >
                  NEPSE
                </Link>
                <Link
                  href="/finance"
                  className="rounded-lg bg-surface-alt px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-border"
                  onClick={() => setSidebarOpen(false)}
                >
                  {language === "ne" ? "विनिमय दर" : "Finance"}
                </Link>
              </div>
            </div>

            {/* Sign in / Sign up (logged out) */}
            {!session?.user && (
              <div className="border-t border-border px-4 py-3 shrink-0">
                <p className="text-xs font-medium text-muted mb-2">
                  {language === "ne" ? "खाता" : "Account"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-surface-alt px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-border"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    {t("common.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-hover"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {t("common.register")}
                  </Link>
                </div>
              </div>
            )}

            {/* User / Admin links in sidebar */}
            {session?.user && (
              <div className="border-t border-border px-4 py-3 shrink-0">
                <p className="text-xs font-medium text-muted mb-2">
                  {language === "ne" ? "प्रयोगकर्ता" : "User"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/profile" className="rounded-lg bg-surface-alt px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-border" onClick={() => setSidebarOpen(false)}>
                    {language === "ne" ? "प्रोफाइल" : "Profile"}
                  </Link>
                  {isAdmin && (
                    <Link href={adminPath()} className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-hover" onClick={() => setSidebarOpen(false)}>
                      {language === "ne" ? "एडमिन" : "Admin"}
                    </Link>
                  )}
                  {!isAdmin && (
                    <button onClick={handleLogout} className="rounded-lg bg-surface-alt px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-border text-left">
                      {language === "ne" ? "लगआउट" : "Logout"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Language edition button */}
            <div className="border-t border-border px-4 py-3 shrink-0">
              <button
                onClick={() => { setLanguage(language === "ne" ? "en" : "ne"); setSidebarOpen(false); }}
                className="w-full py-2.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
              >
                {language === "ne" ? "ENGLISH EDITION" : "\u0928\u0947\u092A\u093E\u0932\u0940 \u0938\u0902\u0938\u094D\u0915\u0930\u0923"}
              </button>
            </div>
          </nav>
        </div>,
      document.body
    )}
    </>
  );
}
