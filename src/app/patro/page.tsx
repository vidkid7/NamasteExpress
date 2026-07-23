"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PatroTabs } from "@/components/patro/PatroTabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { FestivalIcon } from "@/lib/decorative-icons";
import {
  Calendar,
  Clock,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";
import {
  bsToAD, daysInBSMonth, firstDayOfBSMonth, todayBS,
  BS_MONTHS_NE, BS_MONTHS_EN, DAYS_NE, DAYS_EN, DAYS_FULL_NE, DAYS_FULL_EN,
  BS_FESTIVALS, formatADDate, toNepaliNums,
} from "@/lib/nepali-date";

const TITHIS_NE = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
];

type HolidayDB = {
  id: string; title: string; title_en?: string | null;
  bs_year: number; bs_month: number; bs_day: number;
  type: string; is_public: boolean;
};

export default function PatroPage() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [viewYear, setViewYear] = useState(2082);
  const [viewMonth, setViewMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [holidays, setHolidays] = useState<HolidayDB[]>([]);

  useEffect(() => {
    setMounted(true);
    const bs = todayBS();
    setViewYear(bs.year);
    setViewMonth(bs.month);
    setSelectedDay(bs.day);
  }, []);

  // Fetch holidays from DB
  useEffect(() => {
    fetch(`/api/v1/calendar/holidays?year=${viewYear}&month=${viewMonth}`)
      .then(r => r.json())
      .then(d => { if (d.success) setHolidays(d.data); })
      .catch(() => {});
  }, [viewYear, viewMonth]);

  const todayBSDate = useMemo(() => (mounted ? todayBS() : null), [mounted]);
  const daysInMonth = daysInBSMonth(viewYear, viewMonth);
  const firstDay = firstDayOfBSMonth(viewYear, viewMonth);

  // Merge DB holidays + static festivals into one map
  const festivalMap = useMemo(() => {
    const map: Record<number, { name: string; icon?: string; isPublic: boolean }[]> = {};
    // Static festivals
    BS_FESTIVALS.filter(f => f.bsMonth === viewMonth).forEach(f => {
      if (f.bsDay <= daysInMonth) {
        const entry = { name: language === "ne" ? f.ne : f.en, icon: f.icon, isPublic: false };
        map[f.bsDay] = map[f.bsDay] ? [...map[f.bsDay], entry] : [entry];
      }
    });
    // DB holidays (override or add)
    holidays.forEach(h => {
      const name = language === "en" && h.title_en ? h.title_en : h.title;
      const entry = { name, icon: undefined as string | undefined, isPublic: h.is_public };
      // Avoid duplicates
      if (!map[h.bs_day]?.some(e => e.name === name)) {
        map[h.bs_day] = map[h.bs_day] ? [...map[h.bs_day], entry] : [entry];
      }
    });
    return map;
  }, [viewMonth, daysInMonth, holidays, language]);

  // Upcoming events (next 30 days from today)
  const upcomingEvents = useMemo(() => {
    if (!todayBSDate) return [];
    const events: { name: string; bsDay: number; bsMonth: number; daysUntil: number; icon?: string }[] = [];
    // Current month festivals after today
    BS_FESTIVALS.filter(f => f.bsMonth === todayBSDate.month && f.bsDay > todayBSDate.day && f.bsDay <= daysInBSMonth(todayBSDate.year, todayBSDate.month))
      .forEach(f => events.push({ name: language === "ne" ? f.ne : f.en, bsDay: f.bsDay, bsMonth: f.bsMonth, daysUntil: f.bsDay - todayBSDate.day, icon: f.icon }));
    // Next month festivals
    const nextMonth = todayBSDate.month === 12 ? 1 : todayBSDate.month + 1;
    const daysLeftThisMonth = daysInBSMonth(todayBSDate.year, todayBSDate.month) - todayBSDate.day;
    BS_FESTIVALS.filter(f => f.bsMonth === nextMonth && f.bsDay <= 30)
      .forEach(f => events.push({ name: language === "ne" ? f.ne : f.en, bsDay: f.bsDay, bsMonth: f.bsMonth, daysUntil: daysLeftThisMonth + f.bsDay, icon: f.icon }));
    return events.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 8);
  }, [todayBSDate, language]);

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(v => v - 1); setViewMonth(12); }
    else setViewMonth(v => v - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(v => v + 1); setViewMonth(1); }
    else setViewMonth(v => v + 1);
    setSelectedDay(null);
  }
  function goToday() {
    if (todayBSDate) {
      setViewYear(todayBSDate.year);
      setViewMonth(todayBSDate.month);
      setSelectedDay(todayBSDate.day);
    }
  }

  const isToday = (day: number) =>
    todayBSDate?.year === viewYear && todayBSDate?.month === viewMonth && todayBSDate?.day === day;

  const selectedAD = selectedDay ? bsToAD(viewYear, viewMonth, selectedDay) : null;
  const todayAD = mounted ? new Date() : null;
  const mn = (ne: string, en: string) => language === "ne" ? ne : en;

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8" style={{ background: "var(--background)", minHeight: "100vh" }}>
        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
            style={{ background: "linear-gradient(135deg,#e11b22,#c41018)" }}><Calendar className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
              {mn("नेपाली पात्रो", "Nepali Calendar (Patro)")}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {mn("विक्रम सम्वत् — बिशेष दिन, तिथि र पर्वहरू", "Bikram Sambat — dates, tithis & festivals")}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <PatroTabs />

        {/* Today Hero */}
        {mounted && todayBSDate && todayAD && (
          <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #c62828 0%, #b71c1c 50%, #8b0000 100%)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle at 15% 85%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.08) 0%, transparent 45%)"
            }} />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm opacity-75 mb-1">
                  {language === "ne" ? DAYS_FULL_NE[todayBSDate.dayOfWeek] : DAYS_FULL_EN[todayBSDate.dayOfWeek]}
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                  {language === "ne"
                    ? `${toNepaliNums(todayBSDate.day)} ${BS_MONTHS_NE[todayBSDate.month - 1]}, ${toNepaliNums(todayBSDate.year)}`
                    : `${todayBSDate.day} ${BS_MONTHS_EN[todayBSDate.month - 1]}, ${todayBSDate.year}`}
                </p>
                <p className="text-sm opacity-70 mt-1">{mn("बिक्रम सम्बत्", "Bikram Sambat")}</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm">
                <p className="text-xs opacity-70 mb-1">{mn("आजको सम्वत् मिति", "Today in AD")}</p>
                <p className="text-xl font-bold">
                  {formatADDate(todayAD, language)}
                </p>
                <p className="text-xs mt-1 opacity-70">
                  {mn(`तिथि: ${TITHIS_NE[todayBSDate.day % 15]}`, `Tithi: ${TITHIS_NE[todayBSDate.day % 15]}`)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(135deg, #c62828, #b71c1c)", color: "#fff" }}>
              <button onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
                aria-label={mn("अघिल्लो महिना", "Previous month")}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-lg font-black">
                  {language === "ne" ? BS_MONTHS_NE[viewMonth - 1] : BS_MONTHS_EN[viewMonth - 1]}
                  {" "}
                  {language === "ne" ? toNepaliNums(viewYear) : viewYear}
                </p>
              </div>
              <button onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
                aria-label={mn("अर्को महिना", "Next month")}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Today / Month/Year selectors */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <select value={viewYear} onChange={e => { setViewYear(+e.target.value); setSelectedDay(null); }}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ background: "var(--surface)", color: "var(--foreground)", borderColor: "var(--border)" }}>
                  {Array.from({ length: 10 }, (_, i) => 2078 + i).map(y => (
                    <option key={y} value={y}>{language === "ne" ? toNepaliNums(y) : y}</option>
                  ))}
                </select>
                <select value={viewMonth} onChange={e => { setViewMonth(+e.target.value); setSelectedDay(null); }}
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ background: "var(--surface)", color: "var(--foreground)", borderColor: "var(--border)" }}>
                  {BS_MONTHS_NE.map((m, i) => (
                    <option key={i} value={i + 1}>{language === "ne" ? m : BS_MONTHS_EN[i]}</option>
                  ))}
                </select>
              </div>
              <button onClick={goToday}
                className="text-xs px-3 py-1 rounded-full font-semibold transition-all hover:opacity-80"
                style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {mn("आज", "Today")}
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-2 pb-1">
              {(language === "ne" ? DAYS_NE : DAYS_EN).map((d, i) => (
                <div key={d} className="text-center py-2 text-xs font-bold"
                  style={{ color: i === 0 ? "#e53935" : i === 6 ? "#1565c0" : "var(--muted)" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells — improved with tithis and event badges */}
            <div className="grid grid-cols-7 gap-px px-2 pb-4" style={{ background: "var(--border)" }}>
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} style={{ background: "var(--surface)" }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isT = isToday(day);
                const isSelected = selectedDay === day;
                const events = festivalMap[day];
                const hasEvent = !!events;
                const hasPublicHoliday = events?.some(e => e.isPublic);
                const adDay = bsToAD(viewYear, viewMonth, day);
                const dow = adDay.getDay();
                const isSun = dow === 0;
                const isSat = dow === 6;
                const tithi = TITHIS_NE[day % 15];

                return (
                  <button key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className="relative flex flex-col items-center p-1 sm:p-1.5 min-h-[56px] sm:min-h-[62px] transition-all active:scale-95"
                    style={{
                      background: isT ? "#c62828" : isSelected ? "var(--accent-light)" : "var(--surface)",
                      color: isT ? "#fff" : isSelected ? "var(--accent)" : hasPublicHoliday || isSun ? "#e53935" : isSat ? "#1565c0" : "var(--foreground)",
                      fontWeight: isT || isSelected ? 700 : 400,
                      borderBottom: isSelected && !isT ? "2px solid var(--accent)" : "none",
                    }}>
                    {/* BS day number (large) */}
                    <span className="text-base leading-none font-bold">
                      {language === "ne" ? toNepaliNums(day) : day}
                    </span>
                    {/* AD day (small) */}
                    <span className="text-[9px] opacity-50 leading-none mt-0.5">
                      {adDay.getDate()}
                    </span>
                    {/* Tithi (tiny) */}
                    <span className="text-[8px] opacity-40 leading-none mt-0.5 truncate max-w-full">
                      {tithi.slice(0, 4)}
                    </span>
                    {/* Event indicator */}
                    {hasEvent && (
                      <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[7px] font-bold"
                        style={{ background: hasPublicHoliday ? "#e53935" : "#f59e0b", color: "#fff" }}>
                        {events.length > 1 ? `+${events.length}` : "•"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-xs border-t"
              style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "#c62828" }} /> {mn("आज", "Today")}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: "#e53935" }} /> {mn("सार्वजनिक बिदा", "Public Holiday")}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} /> {mn("पर्व/उत्सव", "Festival")}
              </span>
              <span className="flex items-center gap-1">
                <Circle className="h-3 w-3 fill-current text-red-500" /> {mn("आइतबार", "Sunday")}
              </span>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Selected Day Info */}
            {selectedDay && selectedAD && (
              <div className="rounded-xl overflow-hidden animate-fadeIn"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="px-4 py-3 text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#c62828,#b71c1c)" }}>
                  {language === "ne"
                    ? `${toNepaliNums(selectedDay)} ${BS_MONTHS_NE[viewMonth - 1]}, ${toNepaliNums(viewYear)}`
                    : `${selectedDay} ${BS_MONTHS_EN[viewMonth - 1]}, ${viewYear}`}
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--muted)" }}>{mn("सन् मिति", "AD Date")}</span>
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {formatADDate(selectedAD, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--muted)" }}>{mn("वार", "Weekday")}</span>
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {language === "ne" ? DAYS_FULL_NE[selectedAD.getDay()] : DAYS_FULL_EN[selectedAD.getDay()]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--muted)" }}>{mn("तिथि", "Tithi")}</span>
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {TITHIS_NE[selectedDay % 15]}
                    </span>
                  </div>
                  {festivalMap[selectedDay]?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: f.isPublic ? "rgba(229,57,53,0.1)" : "var(--accent-light)" }}>
                      <FestivalIcon name={f.icon} className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-semibold" style={{ color: f.isPublic ? "#c62828" : "var(--accent)" }}>
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="px-4 py-3 text-sm font-bold flex items-center gap-2"
                  style={{ background: "var(--surface-alt)", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                  <Clock className="h-4 w-4" /> {mn("आगामी पर्वहरू", "Upcoming Events")}
                </div>
                <div className="p-3 space-y-2">
                  {upcomingEvents.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
                      style={{ background: "var(--surface-alt)" }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--accent-light)" }}>
                        <FestivalIcon name={e.icon} className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{e.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {mn(`${toNepaliNums(e.daysUntil)} दिन बाँकी`, `${e.daysUntil} days left`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* This month's festivals */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="px-4 py-3 text-sm font-bold flex items-center gap-2"
                style={{ background: "var(--surface-alt)", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                <PartyPopper className="h-4 w-4" /> {mn("यस महिनाका पर्वहरू", "This Month's Festivals")}
              </div>
              <div className="p-3 space-y-2">
                {Object.entries(festivalMap).length === 0 ? (
                  <p className="text-xs text-center py-2" style={{ color: "var(--muted)" }}>
                    {mn("यस महिना कुनै पर्व छैन", "No festivals this month")}
                  </p>
                ) : Object.entries(festivalMap).sort(([a], [b]) => +a - +b).map(([dayStr, events]) =>
                  events.map((f, i) => (
                    <button key={`${dayStr}-${i}`} onClick={() => setSelectedDay(+dayStr)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-[var(--surface-alt)]">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: f.isPublic ? "rgba(229,57,53,0.1)" : "var(--accent-light)" }}>
                        <FestivalIcon name={f.icon} className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{f.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {language === "ne"
                            ? `${BS_MONTHS_NE[viewMonth - 1]} ${toNepaliNums(+dayStr)}`
                            : `${BS_MONTHS_EN[viewMonth - 1]} ${dayStr}`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Month List */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="px-4 py-3 text-sm font-bold"
                style={{ background: "var(--surface-alt)", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                {mn("महिना छान्नुहोस्", "Select Month")}
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-3">
                {BS_MONTHS_NE.map((mNe, i) => (
                  <button key={i}
                    onClick={() => { setViewMonth(i + 1); setSelectedDay(null); }}
                    className="py-2 px-1 text-xs rounded-lg text-center transition-all font-medium"
                    style={{
                      background: viewMonth === i + 1 ? "#c62828" : "var(--surface-alt)",
                      color: viewMonth === i + 1 ? "#fff" : "var(--foreground)",
                    }}>
                    {language === "ne" ? mNe : BS_MONTHS_EN[i].slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
