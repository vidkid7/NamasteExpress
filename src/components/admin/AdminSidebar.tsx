"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FontSizeProvider, useFontSize } from "@/contexts/FontSizeContext";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { adminPath, internalAdminPath } from "@/lib/admin-path";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  FileText,
  Folder,
  Tag,
  MessageSquare,
  Image as ImageIcon,
  Megaphone,
  Trophy,
  Clapperboard,
  Radio,
  TrendingUp,
  Palmtree,
  Coins,
  ArrowLeftRight,
  Sparkles,
  Mail,
  Users,
  Settings,
  ClipboardList,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { path: "/",             labelNe: "ड्यासबोर्ड",     labelEn: "Dashboard",      icon: <BarChart3 className="h-5 w-5" />, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { path: "/articles",     labelNe: "लेखहरू",         labelEn: "Articles",       icon: <FileText className="h-5 w-5" />, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { path: "/categories",   labelNe: "वर्गहरू",        labelEn: "Categories",     icon: <Folder className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/tags",         labelNe: "ट्यागहरू",       labelEn: "Tags",           icon: <Tag className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/comments",     labelNe: "टिप्पणीहरू",     labelEn: "Comments",       icon: <MessageSquare className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/media",        labelNe: "मिडिया",         labelEn: "Media",          icon: <ImageIcon className="h-5 w-5" />, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { path: "/ads",          labelNe: "विज्ञापन",       labelEn: "Ads",            icon: <Megaphone className="h-5 w-5" />, roles: ["ADMIN"] },
  { path: "/sports",       labelNe: "खेलकुद",         labelEn: "Sports",         icon: <Trophy className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/reels",        labelNe: "रिल्स",          labelEn: "Reels",          icon: <Clapperboard className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/galleries",    labelNe: "ग्यालेरीहरू",    labelEn: "Galleries",      icon: <ImageIcon className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/breaking-news", labelNe: "ब्रेकिङ न्युज", labelEn: "Breaking News", icon: <Radio className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/analytics",    labelNe: "विश्लेषण",       labelEn: "Analytics",      icon: <TrendingUp className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/holidays",     labelNe: "बिदाहरू",        labelEn: "Holidays",       icon: <Palmtree className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/gold-silver",  labelNe: "सुन-चाँदी",      labelEn: "Gold-Silver",    icon: <Coins className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/forex",        labelNe: "विनिमय दर",      labelEn: "Forex Rates",    icon: <ArrowLeftRight className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/rashifal",     labelNe: "राशिफल",         labelEn: "Rashifal",       icon: <Sparkles className="h-5 w-5" />, roles: ["ADMIN", "EDITOR"] },
  { path: "/newsletter",   labelNe: "सदस्यता",        labelEn: "Newsletter",     icon: <Mail className="h-5 w-5" />, roles: ["ADMIN"] },
  { path: "/users",        labelNe: "प्रयोगकर्ता",    labelEn: "Users",          icon: <Users className="h-5 w-5" />, roles: ["ADMIN"] },
  { path: "/settings",     labelNe: "सेटिङ",          labelEn: "Settings",       icon: <Settings className="h-5 w-5" />, roles: ["ADMIN"] },
  { path: "/audit-log",    labelNe: "अडिट लग",        labelEn: "Audit Log",      icon: <ClipboardList className="h-5 w-5" />, roles: ["ADMIN"] },
];

function FontSizerInline() {
  const { increase, decrease, reset, canIncrease, canDecrease } = useFontSize();
  const btnCls =
    "inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold border transition-all select-none";
  const activeCls = "border-border text-foreground hover:bg-surface-alt";
  const disabledCls = "opacity-30 cursor-not-allowed border-transparent";

  return (
    <div className="flex items-center gap-1 justify-center py-2">
      <button onClick={decrease} disabled={!canDecrease} title="Smaller text"
        className={`${btnCls} ${activeCls} ${!canDecrease ? disabledCls : ""}`}
        aria-label="Decrease font size">
        <span style={{ fontSize: "10px" }}>A-</span>
      </button>
      <button onClick={reset} title="Reset text size"
        className={`${btnCls} ${activeCls}`}
        aria-label="Reset font size">
        <span style={{ fontSize: "11px" }}>A</span>
      </button>
      <button onClick={increase} disabled={!canIncrease} title="Larger text"
        className={`${btnCls} ${activeCls} ${!canIncrease ? disabledCls : ""}`}
        aria-label="Increase font size">
        <span style={{ fontSize: "12px" }}>A+</span>
      </button>
    </div>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const role = useAdminRole();
  const { config } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"ne" | "en">("ne");

  useEffect(() => {
    const t = localStorage.getItem("adminTheme") as "light" | "dark" | null;
    if (t) setTheme(t);
    const l = localStorage.getItem("adminLang") as "ne" | "en" | null;
    if (l) setLang(l);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("adminTheme", next);
    document.documentElement.setAttribute("data-admin-theme", next);
    const wrapper = document.querySelector("[data-admin-theme]");
    if (wrapper) wrapper.setAttribute("data-admin-theme", next);
  }

  function toggleLang() {
    const next = lang === "ne" ? "en" : "ne";
    setLang(next);
    localStorage.setItem("adminLang", next);
  }

  function isActive(path: string) {
    const publicPath = adminPath(path);
    const internalPath = internalAdminPath(path);
    if (path === "/") return pathname === publicPath || pathname === internalPath;
    return pathname.startsWith(publicPath) || pathname.startsWith(internalPath);
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-lg shadow-md border border-border"
        style={{ background: "var(--surface)", color: "var(--foreground)" }}
        aria-label="Toggle sidebar"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          width: "16rem",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Brand Header */}
        <div
          className="px-4 py-3.5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href={adminPath()} className="flex items-center gap-3" style={{ color: "var(--foreground)" }}>
            {config.site_logo ? (
              <div className="relative w-9 h-9 rounded-lg bg-white overflow-hidden ring-1 ring-border shrink-0">
                <Image src={config.site_logo} alt="Logo" fill className="object-contain p-0.5" unoptimized />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: "var(--accent)" }}
              >
                न
              </div>
            )}
            <div className="leading-tight min-w-0">
              <p className="text-sm font-bold truncate">Admin Panel</p>
              <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>प्रशासन · {config.site_name?.ne}</p>
            </div>
          </Link>
          {/* Language toggle in header */}
          <button
            onClick={toggleLang}
            className="text-[10px] font-bold px-2 py-1 rounded border transition-colors hover:bg-surface-alt"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            title="Toggle language labels"
          >
            {lang === "ne" ? "EN" : "ने"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: "thin" }}>
          {navItems.filter(item => item.roles.includes(role)).map((item) => {
            const href = adminPath(item.path);
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={href}
                onClick={() => setOpen(false)}
                className={`admin-nav-link ${active ? "active" : ""}`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate">
                    {lang === "ne" ? item.labelNe : item.labelEn}
                  </span>
                  {lang === "ne" && (
                    <span className="block text-[10px] truncate opacity-60">{item.labelEn}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="px-3 pb-3 pt-2 border-t space-y-1.5" style={{ borderColor: "var(--border)" }}>
          {/* Font size controls */}
          <div
            className="rounded-lg px-2"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
          >
            <p className="text-[10px] text-center pt-1.5 font-medium" style={{ color: "var(--muted)" }}>
              अक्षर आकार / Font Size
            </p>
            <FontSizerInline />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors border border-border hover:bg-surface-alt"
            style={{ background: "var(--surface)", color: "var(--foreground)" }}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>

          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border border-border hover:bg-surface-alt"
            style={{ color: "var(--foreground)", background: "var(--surface)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>
            <span>साइटमा फर्कनुहोस् / Back to site</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors border border-transparent hover:bg-error-light text-error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout / लगआउट</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function AdminSidebar() {
  return (
    <FontSizeProvider>
      <SidebarContent />
    </FontSizeProvider>
  );
}
