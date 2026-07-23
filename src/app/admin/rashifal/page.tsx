import { prisma } from "@/lib/prisma";
import { AdminRashifalActions, AdminRashifalRow } from "./AdminRashifalActions";

export const dynamic = "force-dynamic";

export default async function AdminRashifalPage() {
  const entriesRaw = await prisma.rashifal.findMany({
    orderBy: [{ ad_date: "desc" }, { sign: "asc" }],
    take: 24,
  });
  const entries = entriesRaw.map((r) => ({
    id: r.id,
    sign: r.sign,
    sign_ne: r.sign_ne,
    bs_year: r.bs_year,
    bs_month: r.bs_month,
    bs_day: r.bs_day,
    ad_date: r.ad_date.toISOString(),
    prediction: r.prediction,
    prediction_en: r.prediction_en,
    rating: r.rating,
  }));

  const signs = ["mesh", "brish", "mithun", "karkat", "simha", "kanya", "tula", "brishchik", "dhanu", "makar", "kumbha", "meen"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rashifal / राशिफल</h1>
      </div>

      <AdminRashifalActions signs={signs} />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Sign</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Prediction</th>
              <th className="text-center p-3 font-medium" style={{ color: "var(--muted)" }}>Rating</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((r) => (
              <AdminRashifalRow key={r.id} entry={r} signs={signs} />
            ))}
          </tbody>
        </table>
        {!entries.length && (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>No rashifal entries found</p>
        )}
      </div>
    </div>
  );
}
