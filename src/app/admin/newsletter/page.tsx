import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 20;

  const where = search
    ? {
        email: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [subscriptions, total, activeTotal] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsletterSubscription.count({ where }),
    prisma.newsletterSubscription.count({ where: { is_active: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Footer newsletter signups saved from the public website.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-64">
          <div className="card p-3">
            <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Total</p>
            <p className="mt-1 text-2xl font-bold">{total}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Active</p>
            <p className="mt-1 text-2xl font-bold">{activeTotal}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <form className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search email..."
            className="w-full rounded-md px-3 py-2 text-sm sm:max-w-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <button type="submit" className="btn-secondary w-full sm:w-auto">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="p-3 text-left font-medium" style={{ color: "var(--muted)" }}>Email</th>
              <th className="p-3 text-left font-medium" style={{ color: "var(--muted)" }}>Language</th>
              <th className="p-3 text-left font-medium" style={{ color: "var(--muted)" }}>Source</th>
              <th className="p-3 text-left font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="p-3 text-left font-medium" style={{ color: "var(--muted)" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length ? (
              subscriptions.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="p-3 font-medium">{item.email}</td>
                  <td className="p-3 uppercase" style={{ color: "var(--muted)" }}>{item.language}</td>
                  <td className="p-3" style={{ color: "var(--muted)" }}>{item.source ?? "website"}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3" style={{ color: "var(--muted)" }}>
                    {item.created_at.toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No subscribers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <a
            href={adminPath(`/newsletter?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`)}
            className={`btn-secondary ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Previous
          </a>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          <a
            href={adminPath(`/newsletter?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`)}
            className={`btn-secondary ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            Next
          </a>
        </div>
      )}
    </div>
  );
}
