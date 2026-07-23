"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { adminPath } from "@/lib/admin-path";

const FOOTER_SECTIONS = {
  news: [
    { key: "samachar", href: "/categories/samachar" },
    { key: "rajniti", href: "/categories/rajniti" },
    { key: "bichar", href: "/categories/bichar" },
    { key: "antarvaarta", href: "/categories/antarvaarta" },
    { key: "antarrashtriya", href: "/categories/antarrashtriya" },
  ],
  business: [
    { key: "arthatantra", href: "/categories/arthatantra" },
    { key: "shareMarket", href: "/share-market" },
    { key: "prabidhi", href: "/categories/prabidhi" },
    { key: "finance", href: "/finance" },
  ],
  lifestyle: [
    { key: "feature", href: "/categories/feature" },
    { key: "entertainment", href: "/categories/bichitra" },
    { key: "sahitya", href: "/categories/sahitya" },
    { key: "khelkud", href: "/categories/khelkud" },
  ],
  special: [
    { key: "coverStory", href: "/categories/cover-story" },
    { key: "video", href: "/categories/video" },
    { key: "photoGallery", href: "/categories/photo-gallery" },
    { key: "patro", href: "/patro" },
    { key: "horoscope", href: "/rashifal" },
  ],
};

type FooterColumnProps = {
  title: string;
  items: Array<{ key: string; href: string }>;
  translate: (key: string) => string;
};

function FooterColumn({ title, items, translate }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-footer-heading">
        {title}
      </h3>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="inline-flex max-w-full items-center gap-2 text-sm text-footer-text transition-colors hover:text-footer-heading"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent/70" />
              <span className="truncate">{translate(`nav.${item.key}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-footer-input-bg px-3 py-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-footer-icon-bg text-accent">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold text-footer-text uppercase tracking-wider">{label}</span>
        <span className="block truncate text-sm font-semibold text-footer-heading">{value}</span>
      </span>
    </div>
  );
}

function SocialIcon({ children, href, label }: { children: ReactNode; href?: string; label: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full bg-footer-input-bg text-footer-heading transition-colors hover:bg-accent hover:text-white"
      aria-label={label}
    >
      {children}
    </a>
  );
}

const phoneIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const mailIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
  </svg>
);

const locationIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z" />
  </svg>
);

export function Footer() {
  const { language, t } = useLanguage();
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const siteName = language === "en" ? config.site_name.en : config.site_name.ne;
  const tagline = language === "en" ? config.site_tagline.en : config.site_tagline.ne;
  const address = language === "en" ? config.contact_address.en : config.contact_address.ne;
  const copyrightRaw = language === "en" ? config.copyright_text.en : config.copyright_text.ne;
  const copyright = copyrightRaw.replace("{year}", new Date().getFullYear().toString());
  const sectionTitle = (ne: string, en: string) => (language === "ne" ? ne : en);

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, language }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscribe failed");
      }

      setStatus("success");
      setEmail("");
      setMessage(language === "ne" ? "सदस्यता सुरक्षित भयो।" : "Subscription saved.");
    } catch {
      setStatus("error");
      setMessage(language === "ne" ? "अहिले सदस्यता लिन सकिएन।" : "Could not subscribe right now.");
    }
  }

  return (
    <footer className="mt-2 bg-footer-bg text-footer-text">
      {/* Thin accent rule */}
      <div style={{ height: 3, background: "var(--accent)" }} />

      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12">
        <section className="rounded-xl border border-footer-border bg-footer-input-bg p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                <span className="inline-block w-4 h-px" style={{ background: "var(--accent)" }} />
                {language === "ne" ? "समाचार अलर्ट" : "News alerts"}
              </p>
              <h2 className="text-xl font-bold leading-tight text-footer-heading sm:text-2xl" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                {language === "ne" ? "ताजा समाचार इमेलमा पाउनुहोस्" : "Get the latest news by email"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-footer-text">
                {language === "ne"
                  ? "मुख्य खबर, अपडेट र विशेष सामग्री सिधै आफ्नो इमेलमा।"
                  : "Top stories, updates, and selected features delivered to your inbox."}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="sr-only" htmlFor="footer-newsletter-email">
                {language === "ne" ? "इमेल" : "Email"}
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={language === "ne" ? "आफ्नो इमेल प्रविष्ट गर्नुहोस्" : "Enter your email"}
                className="min-w-0 rounded-md border border-footer-border bg-footer-input-bg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
                required
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
              >
                {status === "submitting"
                  ? language === "ne" ? "पठाउँदै..." : "Saving..."
                  : language === "ne" ? "सदस्यता लिनुहोस्" : "Subscribe"}
              </button>
              {message && (
                <p className={`text-xs font-medium sm:col-span-2 ${status === "success" ? "text-success" : "text-error"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
          {/* Brand column */}
          <div className="min-w-0 space-y-5">
            <Link href="/" className="inline-flex max-w-full items-center gap-3">
              {config.site_logo ? (
                <Image
                  src={config.site_logo}
                  alt={siteName}
                  width={84}
                  height={84}
                  className="h-16 w-16 shrink-0 rounded-xl bg-white object-contain p-1 shadow-sm"
                  unoptimized
                />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-accent text-2xl font-black text-white">
                  न
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-xl font-bold text-footer-heading" style={{ fontFamily: "var(--font-nepali-serif)" }}>{siteName}</span>
                {config.registration_number && (
                  <span className="block truncate text-xs text-footer-text">
                    {language === "ne" ? "दर्ता नं:" : "Reg:"} {config.registration_number}
                  </span>
                )}
              </span>
            </Link>

            {tagline && <p className="max-w-md text-sm leading-6 text-footer-text">{tagline}</p>}

            <div className="grid gap-2">
              <ContactItem icon={phoneIcon} label={language === "ne" ? "फोन" : "Phone"} value={config.contact_phone} />
              <ContactItem icon={mailIcon} label={language === "ne" ? "इमेल" : "Email"} value={config.contact_email} />
              <ContactItem icon={locationIcon} label={language === "ne" ? "ठेगाना" : "Address"} value={address} />
            </div>

            <div className="flex flex-wrap gap-2">
              <SocialIcon href={config.social_facebook} label="Facebook">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </SocialIcon>
              <SocialIcon href={config.social_twitter} label="X/Twitter">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" /></svg>
              </SocialIcon>
              <SocialIcon href={config.social_youtube} label="YouTube">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" /></svg>
              </SocialIcon>
              <SocialIcon href={config.social_instagram} label="Instagram">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </SocialIcon>
              <SocialIcon href={config.social_tiktok} label="TikTok">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </SocialIcon>
            </div>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <FooterColumn title={sectionTitle("समाचार", "News")} items={FOOTER_SECTIONS.news} translate={t} />
            <FooterColumn title={sectionTitle("बिजनेस", "Business")} items={FOOTER_SECTIONS.business} translate={t} />
            <FooterColumn title={sectionTitle("जीवनशैली", "Lifestyle")} items={FOOTER_SECTIONS.lifestyle} translate={t} />
            <div className="min-w-0">
              <FooterColumn title={sectionTitle("विशेष", "Special")} items={FOOTER_SECTIONS.special} translate={t} />
              <div className="mt-5 grid gap-2">
                <Link href="/about" className="text-sm font-medium text-footer-text hover:text-footer-heading">{t("footer.about")}</Link>
                <Link href="/privacy-policy" className="text-sm font-medium text-footer-text hover:text-footer-heading">{t("footer.privacyPolicy")}</Link>
                <Link href="/terms-of-service" className="text-sm font-medium text-footer-text hover:text-footer-heading">{t("footer.termsOfService")}</Link>
                <a href="/rss.xml" className="text-sm font-medium text-footer-text hover:text-footer-heading">RSS Feed</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-footer-border">
        <div className="mx-auto max-w-7xl px-4 py-5 pb-24 text-center text-xs font-medium text-footer-text sm:px-6 md:flex md:items-center md:justify-between md:pb-5 md:text-left">
          <p>{copyright}</p>
          <div className="mt-2 flex items-center justify-center gap-4 md:mt-0">
            <Link href="/about" className="hover:text-footer-heading">
              {t("footer.about")}
            </Link>
            <Link href={adminPath()} className="hover:text-footer-heading">
              {language === "ne" ? "एडमिन प्यानल" : "Admin Panel"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
