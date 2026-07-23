import { prisma } from "@/lib/prisma";
import { AdminForexActions, AdminForexRow } from "./AdminForexActions";

export const dynamic = "force-dynamic";

export default async function AdminForexPage() {
  const ratesRaw = await prisma.forexRate.findMany({
    orderBy: [{ date: "desc" }, { currency: "asc" }],
    take: 50,
  });

  const rates = ratesRaw.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    currency: r.currency,
    currency_name: r.currency_name,
    unit: r.unit,
    buy: r.buy,
    sell: r.sell,
  }));

  const grouped = rates.reduce<Record<string, typeof rates>>((acc, r) => {
    const key = new Date(r.date).toLocaleDateString();
    (acc[key] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forex Rates / विनिमय दर</h1>
      </div>

      <AdminForexActions />

      {Object.entries(grouped).map(([date, dateRates]) => (
        <div key={date} className="card overflow-x-auto">
          <div className="px-4 py-2 text-xs font-bold" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>{date}</div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Currency</th>
                <th className="text-center p-3 font-medium" style={{ color: "var(--muted)" }}>Unit</th>
                <th className="text-right p-3 font-medium" style={{ color: "var(--muted)" }}>Buy (NPR)</th>
                <th className="text-right p-3 font-medium" style={{ color: "var(--muted)" }}>Sell (NPR)</th>
                <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dateRates.map((r) => (
                <AdminForexRow key={r.id} rate={r} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {!rates.length && (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>No forex rates found</div>
      )}
    </div>
  );
}
