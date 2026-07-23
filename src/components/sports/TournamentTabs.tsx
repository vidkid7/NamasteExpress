"use client";

import { useState } from "react";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
}

interface TournamentTabsProps {
  tournaments: Tournament[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function TournamentTabs({ tournaments, activeId, onSelect }: TournamentTabsProps) {
  const [scrollLeft, setScrollLeft] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft > 0)}
      >
        <button
          onClick={() => onSelect(null)}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={{
            background: activeId === null ? "var(--accent)" : "var(--surface)",
            color: activeId === null ? "#fff" : "var(--foreground)",
            border: `1px solid ${activeId === null ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          सबै
        </button>
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: activeId === t.id ? "var(--accent)" : "var(--surface)",
              color: activeId === t.id ? "#fff" : "var(--foreground)",
              border: `1px solid ${activeId === t.id ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
      {scrollLeft && (
        <div
          className="absolute left-0 top-0 bottom-2 w-8 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--background), transparent)" }}
        />
      )}
    </div>
  );
}
