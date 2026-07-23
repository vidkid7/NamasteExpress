"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeader } from "./SectionHeader";

interface MatchData {
  id: string;
  home_team: { name: string; name_en?: string | null };
  away_team: { name: string; name_en?: string | null };
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string | Date;
  venue?: string | null;
  tournament: { name: string; name_en?: string | null };
}

export function LiveScoreWidget({ matches }: { matches: MatchData[] }) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!matches.length) return null;

  const teamName = (t: { name: string; name_en?: string | null }) =>
    language === "en" && t.name_en ? t.name_en : t.name;

  const formatTime = (date: string | Date) => {
    if (!mounted) {
      // Stable server-safe format — no locale digits
      return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return new Date(date).toLocaleTimeString(language === "ne" ? "ne-NP" : "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section>
      <SectionHeader titleKey="sections.liveScore" color="#e65100" href="/sports" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {matches.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {language === "en" && m.tournament.name_en ? m.tournament.name_en : m.tournament.name}
              </span>
              {m.status === "LIVE" && (
                <span className="text-[10px] font-bold text-error flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  LIVE
                </span>
              )}
              {m.status === "COMPLETED" && (
                <span className="text-[10px] font-bold text-success">FT</span>
              )}
              {m.status === "UPCOMING" && (
                <span suppressHydrationWarning className="text-[10px] text-muted">
                  {formatTime(m.match_date)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{teamName(m.home_team)}</span>
              <span className="text-lg font-bold mx-3">
                {m.home_score ?? "-"} : {m.away_score ?? "-"}
              </span>
              <span className="font-semibold">{teamName(m.away_team)}</span>
            </div>
            {m.venue && <p className="text-[10px] text-muted mt-2 text-center">{m.venue}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
