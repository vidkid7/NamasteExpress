import { prisma } from "@/lib/prisma";
import { AdminGoldSilverActions, AdminGoldSilverRow } from "./AdminGoldSilverActions";

export const dynamic = "force-dynamic";

export default async function AdminGoldSilverPage() {
  const pricesRaw = await prisma.goldSilverPrice.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  const prices = pricesRaw.map((p) => ({
    id: p.id,
    date: p.date.toISOString(),
    fine_gold: p.fine_gold,
    tejabi_gold: p.tejabi_gold,
    silver: p.silver,
    source: p.source,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gold & Silver / सुन-चाँदी</h1>
      </div>

      <AdminGoldSilverActions />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
              <th className="text-right p-3 font-medium" style={{ color: "var(--muted)" }}>Gold 24k/tola</th>
              <th className="text-right p-3 font-medium" style={{ color: "var(--muted)" }}>Gold 22k/tola</th>
              <th className="text-right p-3 font-medium" style={{ color: "var(--muted)" }}>Silver/tola</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Source</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <AdminGoldSilverRow key={p.id} price={p} />
            ))}
          </tbody>
        </table>
        {!prices.length && (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>No prices found</p>
        )}
      </div>
    </div>
  );
}
