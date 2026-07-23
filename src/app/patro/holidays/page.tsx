"use client";

import { useState, useEffect } from "react";
import { Umbrella } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PatroTabs } from "@/components/patro/PatroTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { todayBS, BS_MONTHS_NE, BS_MONTHS_EN, toNepaliNums } from "@/lib/nepali-date";

type Holiday = {
  id: string; title: string; title_en?: string | null;
  bs_year: number; bs_month: number; bs_day: number;
  ad_date: string; type: string; is_public: boolean;
  description?: string | null; description_en?: string | null;
};

export default function HolidaysPage() {
  const { language } = useLanguage();
  const [year, setYear] = useState(2082);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const mn = (ne: string, en: string) => language === "ne" ? ne : en;

  useEffect(() => {
    const bs = todayBS();
    setYear(bs.year);
  }, []);

  useEffect(() => {
    fetch(`/api/v1/calendar/holidays?year=${year}`)
      .then(r => r.json())
      .then(d => { if (d.success) setHolidays(d.data); })
      .catch(() => {});
  }, [year]);

  const filtered = filter === "all" ? holidays : holidays.filter(h => h.type === filter);
  const publicCount = holidays.filter(h => h.is_public).length;

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8" style={{ minHeight: "100vh" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
            style={{ background: "linear-gradient(135deg,#e11b22,#c41018)" }}><Umbrella className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
              {mn("सार्वजनिक बिदाहरू", "Public Holidays")}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {mn(`बि.सं. ${toNepaliNums(year)} — ${toNepaliNums(publicCount)} सार्वजनिक बिदाहरू`,
                `BS ${year} — ${publicCount} public holidays`)}
            </p>
          </div>
        </div>

        <PatroTabs />

        {/* Year selector + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={year} onChange={e => setYear(+e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border"
            style={{ background: "var(--surface)", color: "var(--foreground)", borderColor: "var(--border)" }}>
            {[2081, 2082, 2083, 2084].map(y => (
              <option key={y} value={y}>{language === "ne" ? `बि.सं. ${toNepaliNums(y)}` : `BS ${y}`}</option>
            ))}
          </select>
          {[
            { key: "all", ne: "सबै", en: "All" },
            { key: "public", ne: "सार्वजनिक", en: "Public" },
            { key: "cultural", ne: "सांस्कृतिक", en: "Cultural" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? "#c62828" : "var(--surface)",
                color: filter === f.key ? "#fff" : "var(--muted)",
                border: `1px solid ${filter === f.key ? "#c62828" : "var(--border)"}`,
              }}>
              {language === "ne" ? f.ne : f.en}
            </button>
          ))}
        </div>

        {/* Holidays list grouped by month */}
        <div className="space-y-6">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
            const monthHolidays = filtered.filter(h => h.bs_month === month);
            if (!monthHolidays.length) return null;
            return (
              <div key={month} className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="px-4 py-3 font-bold text-sm flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #c62828, #b71c1c)", color: "#fff" }}>
                  {language === "ne" ? BS_MONTHS_NE[month - 1] : BS_MONTHS_EN[month - 1]}
                  <span className="opacity-60 text-xs">({monthHolidays.length})</span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {monthHolidays.map(h => (
                    <div key={h.id} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ background: h.is_public ? "rgba(229,57,53,0.1)" : "var(--surface-alt)" }}>
                        <span className="text-lg font-black" style={{ color: h.is_public ? "#c62828" : "var(--foreground)" }}>
                          {language === "ne" ? toNepaliNums(h.bs_day) : h.bs_day}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {language === "en" && h.title_en ? h.title_en : h.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          {new Date(h.ad_date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: h.is_public ? "rgba(229,57,53,0.1)" : "rgba(245,158,11,0.1)",
                          color: h.is_public ? "#c62828" : "#f59e0b",
                        }}>
                        {h.is_public ? mn("सार्वजनिक", "Public") : mn("सांस्कृतिक", "Cultural")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
