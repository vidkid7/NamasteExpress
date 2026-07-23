"use client";

import { useState, useEffect } from "react";
import { Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MatchCard } from "@/components/sports/MatchCard";
import { TournamentTabs } from "@/components/sports/TournamentTabs";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
}

interface MatchData {
  id: string;
  home_team: { name: string; logo?: string | null };
  away_team: { name: string; logo?: string | null };
  home_score: number | null;
  away_score: number | null;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  match_date: string;
  venue?: string | null;
  tournament: { name: string };
}

export default function SportsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/sports/tournaments?active=true")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTournaments(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeTournament
      ? `/api/v1/sports/matches?tournament_id=${activeTournament}&pageSize=50`
      : "/api/v1/sports/matches?pageSize=50";

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMatches(json.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTournament]);

  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter((m) => m.status === "UPCOMING");
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
          <span className="inline-flex items-center gap-2"><Trophy className="h-6 w-6" />खेलकुद</span>
        </h1>

        <TournamentTabs
          tournaments={tournaments}
          activeId={activeTournament}
          onSelect={setActiveTournament}
        />

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            लोड हुँदैछ...
          </div>
        ) : (
          <>
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  लाइभ खेलहरू
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      id={m.id}
                      homeTeam={m.home_team}
                      awayTeam={m.away_team}
                      homeScore={m.home_score}
                      awayScore={m.away_score}
                      status={m.status}
                      matchDate={m.match_date}
                      venue={m.venue}
                      tournament={m.tournament}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
                  <Calendar className="h-5 w-5" />
                  आगामी खेलहरू
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      id={m.id}
                      homeTeam={m.home_team}
                      awayTeam={m.away_team}
                      homeScore={m.home_score}
                      awayScore={m.away_score}
                      status={m.status}
                      matchDate={m.match_date}
                      venue={m.venue}
                      tournament={m.tournament}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Matches */}
            {completedMatches.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
                  <CheckCircle2 className="h-5 w-5" />
                  सकिएका खेलहरू
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      id={m.id}
                      homeTeam={m.home_team}
                      awayTeam={m.away_team}
                      homeScore={m.home_score}
                      awayScore={m.away_score}
                      status={m.status}
                      matchDate={m.match_date}
                      venue={m.venue}
                      tournament={m.tournament}
                    />
                  ))}
                </div>
              </section>
            )}

            {matches.length === 0 && (
              <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                कुनै खेल भेटिएन
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
