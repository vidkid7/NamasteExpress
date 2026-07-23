"use client";

interface MatchCardProps {
  id: string;
  homeTeam: { name: string; logo?: string | null };
  awayTeam: { name: string; logo?: string | null };
  homeScore: number | null;
  awayScore: number | null;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  matchDate: string;
  venue?: string | null;
  tournament?: { name: string } | null;
}

const statusConfig = {
  LIVE: { label: "LIVE", bg: "#dc2626", textColor: "#fff", pulse: true },
  UPCOMING: { label: "UPCOMING", bg: "#2563eb", textColor: "#fff", pulse: false },
  COMPLETED: { label: "COMPLETED", bg: "#6b7280", textColor: "#fff", pulse: false },
  CANCELLED: { label: "CANCELLED", bg: "#92400e", textColor: "#fff", pulse: false },
};

export function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  matchDate,
  venue,
  tournament,
}: MatchCardProps) {
  const cfg = statusConfig[status];
  const date = new Date(matchDate);

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header: Tournament + Status */}
      <div className="flex items-center justify-between">
        {tournament && (
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            {tournament.name}
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${cfg.pulse ? "animate-pulse" : ""}`}
          style={{ background: cfg.bg, color: cfg.textColor }}
        >
          {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          {cfg.label}
        </span>
      </div>

      {/* Teams + Scores */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          {homeTeam.logo && (
            <div className="w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {homeTeam.name}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3">
          <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {homeScore ?? "-"}
          </span>
          <span className="text-lg" style={{ color: "var(--muted)" }}>:</span>
          <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {awayScore ?? "-"}
          </span>
        </div>

        <div className="flex-1 text-center">
          {awayTeam.logo && (
            <div className="w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {awayTeam.name}
          </p>
        </div>
      </div>

      {/* Footer: Date + Venue */}
      <div className="flex items-center justify-between gap-2 text-xs truncate" style={{ color: "var(--muted)" }}>
        <span suppressHydrationWarning>{date.toLocaleDateString("ne-NP")} {date.toLocaleTimeString("ne-NP", { hour: "2-digit", minute: "2-digit" })}</span>
        {venue && <span>{venue}</span>}
      </div>
    </div>
  );
}
