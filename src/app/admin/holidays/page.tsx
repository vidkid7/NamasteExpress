import { prisma } from "@/lib/prisma";
import { AdminHolidayActions, AdminHolidayRow } from "./AdminHolidayActions";

export const dynamic = "force-dynamic";

export default async function AdminHolidaysPage() {
  const holidaysRaw = await prisma.holiday.findMany({
    orderBy: [{ bs_year: "desc" }, { bs_month: "asc" }, { bs_day: "asc" }],
    take: 100,
  });
  const holidays = holidaysRaw.map((h) => ({
    id: h.id,
    title: h.title,
    title_en: h.title_en,
    bs_year: h.bs_year,
    bs_month: h.bs_month,
    bs_day: h.bs_day,
    ad_date: h.ad_date.toISOString(),
    type: h.type,
    is_public: h.is_public,
    description: h.description,
    description_en: h.description_en,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Holidays / बिदाहरू</h1>
      </div>

      <AdminHolidayActions />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Title</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>BS Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>AD Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Type</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Public</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <AdminHolidayRow key={h.id} holiday={h} />
            ))}
          </tbody>
        </table>
        {!holidays.length && (
          <p className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>No holidays found</p>
        )}
      </div>
    </div>
  );
}
