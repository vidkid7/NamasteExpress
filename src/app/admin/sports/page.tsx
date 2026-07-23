"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
  is_active: boolean;
  _count?: { matches: number };
}

interface Team {
  id: string;
  name: string;
}

interface MatchData {
  id: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string;
  venue?: string | null;
  tournament: { id: string; name: string };
}

export default function AdminSportsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [activeTab, setActiveTab] = useState<"tournaments" | "matches">("tournaments");
  const [message, setMessage] = useState("");

  // Tournament form
  const [tName, setTName] = useState("");
  const [tSlug, setTSlug] = useState("");
  const [tSport, setTSport] = useState("");

  // Match form
  const [mTournament, setMTournament] = useState("");
  const [mHomeTeam, setMHomeTeam] = useState("");
  const [mAwayTeam, setMAwayTeam] = useState("");
  const [mDate, setMDate] = useState("");
  const [mVenue, setMVenue] = useState("");

  // Score update
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editHomeScore, setEditHomeScore] = useState("");
  const [editAwayScore, setEditAwayScore] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editingTournament, setEditingTournament] = useState<string | null>(null);
  const [editTournamentName, setEditTournamentName] = useState("");
  const [editTournamentSlug, setEditTournamentSlug] = useState("");
  const [editTournamentSport, setEditTournamentSport] = useState("");

  useEffect(() => {
    loadTournaments();
    loadMatches();
    loadTeams();
  }, []);

  async function loadTournaments() {
    const res = await fetch("/api/v1/sports/tournaments");
    const json = await res.json();
    if (json.success) setTournaments(json.data);
  }

  async function loadMatches() {
    const res = await fetch("/api/v1/sports/matches?pageSize=50");
    const json = await res.json();
    if (json.success) setMatches(json.data.data || []);
  }

  async function loadTeams() {
    try {
      const res = await fetch("/api/v1/sports/tournaments");
      const json = await res.json();
      if (json.success) {
        // We'll populate teams from existing match data
      }
    } catch {
      // Teams may not have a dedicated endpoint yet
    }
  }

  async function createTournament(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/v1/sports/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tName, slug: tSlug, sport_type: tSport }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Tournament created!");
      setTName(""); setTSlug(""); setTSport("");
      loadTournaments();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/v1/sports/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournament_id: mTournament,
        home_team_id: mHomeTeam,
        away_team_id: mAwayTeam,
        match_date: mDate,
        venue: mVenue || undefined,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Match created!");
      setMDate(""); setMVenue("");
      loadMatches();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function updateMatch(matchId: string) {
    setMessage("");
    const body: Record<string, unknown> = {};
    if (editHomeScore !== "") body.home_score = parseInt(editHomeScore);
    if (editAwayScore !== "") body.away_score = parseInt(editAwayScore);
    if (editStatus) body.status = editStatus;

    const res = await fetch(`/api/v1/sports/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Match updated!");
      setEditingMatch(null);
      loadMatches();
    } else {
      setMessage(json.error || "Error");
    }
  }

  async function updateTournament(id: string) {
    const res = await fetch("/api/v1/sports/tournaments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editTournamentName, slug: editTournamentSlug, sport_type: editTournamentSport }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("Tournament updated!");
      setEditingTournament(null);
      loadTournaments();
    } else setMessage(json.error || "Error");
  }

  async function deleteTournament(id: string) {
    if (!confirm("Delete this tournament? Tournaments with matches cannot be deleted.")) return;
    const res = await fetch(`/api/v1/sports/tournaments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(json.success ? "Tournament deleted!" : (json.error || "Error"));
    if (json.success) loadTournaments();
  }

  async function deleteMatch(id: string) {
    if (!confirm("Delete this match?")) return;
    const res = await fetch(`/api/v1/sports/matches/${id}`, { method: "DELETE" });
    const json = await res.json();
    setMessage(json.success ? "Match deleted!" : (json.error || "Error"));
    if (json.success) loadMatches();
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold"><span className="inline-flex items-center gap-2"><Trophy className="h-6 w-6" />Sports Management</span></h1>

      {message && (
        <div className="p-3 rounded-md text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("tournaments")}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            background: activeTab === "tournaments" ? "var(--accent)" : "var(--surface)",
            color: activeTab === "tournaments" ? "#fff" : "var(--foreground)",
          }}
        >
          Tournaments
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            background: activeTab === "matches" ? "var(--accent)" : "var(--surface)",
            color: activeTab === "matches" ? "#fff" : "var(--foreground)",
          }}
        >
          Matches
        </button>
      </div>

      {activeTab === "tournaments" && (
        <div className="space-y-6">
          {/* Create Tournament Form */}
          <div className="card p-4 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
            <h2 className="text-lg font-semibold">Create Tournament</h2>
            <form onSubmit={createTournament} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" placeholder="Name" value={tName} onChange={(e) => setTName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <input
                type="text" placeholder="Slug" value={tSlug} onChange={(e) => setTSlug(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <input
                type="text" placeholder="Sport (football, cricket...)" value={tSport} onChange={(e) => setTSport(e.target.value)}
                className="flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <button type="submit" className="btn-primary px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: "var(--accent)", color: "#fff" }}>
                Create
              </button>
            </form>
          </div>

          {/* Tournaments List */}
          <div className="card overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Name</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Sport</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Matches</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">
                      {editingTournament === t.id ? (
                        <div className="flex flex-col gap-1">
                          <input value={editTournamentName} onChange={(e) => setEditTournamentName(e.target.value)} className="px-2 py-1 rounded text-sm" style={inputStyle} />
                          <input value={editTournamentSlug} onChange={(e) => setEditTournamentSlug(e.target.value)} className="px-2 py-1 rounded text-sm" style={inputStyle} />
                        </div>
                      ) : t.name}
                    </td>
                    <td className="p-3" style={{ color: "var(--muted)" }}>
                      {editingTournament === t.id ? (
                        <input value={editTournamentSport} onChange={(e) => setEditTournamentSport(e.target.value)} className="px-2 py-1 rounded text-sm" style={inputStyle} />
                      ) : t.sport_type}
                    </td>
                    <td className="p-3" style={{ color: "var(--muted)" }}>{t._count?.matches ?? 0}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full`}
                        style={{ background: t.is_active ? "#16a34a" : "#6b7280", color: "#fff" }}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      {editingTournament === t.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => updateTournament(t.id)} className="px-2 py-1 rounded text-xs" style={{ background: "#16a34a", color: "#fff" }}>Save</button>
                          <button onClick={() => setEditingTournament(null)} className="px-2 py-1 rounded text-xs" style={{ background: "#6b7280", color: "#fff" }}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingTournament(t.id); setEditTournamentName(t.name); setEditTournamentSlug(t.slug); setEditTournamentSport(t.sport_type); }} className="px-2 py-1 rounded text-xs" style={{ background: "var(--accent)", color: "#fff" }}>Edit</button>
                          <button onClick={() => deleteTournament(t.id)} className="px-2 py-1 rounded text-xs" style={{ background: "#dc2626", color: "#fff" }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {tournaments.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>No tournaments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-6">
          {/* Create Match Form */}
          <div className="card p-4 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
            <h2 className="text-lg font-semibold">Create Match</h2>
            <form onSubmit={createMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={mTournament} onChange={(e) => setMTournament(e.target.value)}
                className="px-3 py-2 rounded-md text-sm" style={inputStyle} required>
                <option value="">Select Tournament</option>
                {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="text" placeholder="Home Team ID" value={mHomeTeam} onChange={(e) => setMHomeTeam(e.target.value)}
                className="px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <input
                type="text" placeholder="Away Team ID" value={mAwayTeam} onChange={(e) => setMAwayTeam(e.target.value)}
                className="px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <input
                type="datetime-local" value={mDate} onChange={(e) => setMDate(e.target.value)}
                className="px-3 py-2 rounded-md text-sm" style={inputStyle} required
              />
              <input
                type="text" placeholder="Venue (optional)" value={mVenue} onChange={(e) => setMVenue(e.target.value)}
                className="px-3 py-2 rounded-md text-sm" style={inputStyle}
              />
              <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: "var(--accent)", color: "#fff" }}>
                Create Match
              </button>
            </form>
          </div>

          {/* Matches List */}
          <div className="card overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Match</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Score</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
                  <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="p-3 font-medium">
                      {m.home_team.name} vs {m.away_team.name}
                      <br />
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{m.tournament.name}</span>
                    </td>
                    <td className="p-3">
                      {editingMatch === m.id ? (
                        <div className="flex gap-1 items-center">
                          <input type="number" value={editHomeScore} onChange={(e) => setEditHomeScore(e.target.value)}
                            className="w-12 px-1 py-0.5 rounded text-sm text-center" style={inputStyle} />
                          <span>-</span>
                          <input type="number" value={editAwayScore} onChange={(e) => setEditAwayScore(e.target.value)}
                            className="w-12 px-1 py-0.5 rounded text-sm text-center" style={inputStyle} />
                        </div>
                      ) : (
                        <span>{m.home_score ?? "-"} : {m.away_score ?? "-"}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingMatch === m.id ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                          className="px-2 py-1 rounded text-xs" style={inputStyle}>
                          <option value="UPCOMING">UPCOMING</option>
                          <option value="LIVE">LIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <StatusBadge status={m.status} />
                      )}
                    </td>
                    <td className="p-3" style={{ color: "var(--muted)" }}>
                      {new Date(m.match_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {editingMatch === m.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => updateMatch(m.id)}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: "#16a34a", color: "#fff" }}>
                            Save
                          </button>
                          <button onClick={() => setEditingMatch(null)}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: "#6b7280", color: "#fff" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button onClick={() => {
                            setEditingMatch(m.id);
                            setEditHomeScore(m.home_score?.toString() || "");
                            setEditAwayScore(m.away_score?.toString() || "");
                            setEditStatus(m.status);
                          }}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: "var(--accent)", color: "#fff" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteMatch(m.id)} className="px-2 py-1 rounded text-xs font-medium" style={{ background: "#dc2626", color: "#fff" }}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>No matches yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    UPCOMING: { bg: "#2563eb", color: "#fff" },
    LIVE: { bg: "#dc2626", color: "#fff" },
    COMPLETED: { bg: "#6b7280", color: "#fff" },
    CANCELLED: { bg: "#92400e", color: "#fff" },
  };
  const s = styles[status] ?? styles.UPCOMING;
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
