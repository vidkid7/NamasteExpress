import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/admin-path";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const action = typeof params.action === "string" ? params.action : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 30;

  const where: Record<string, unknown> = {};
  if (action) {
    where.action = action;
  }
  if (search) {
    where.OR = [
      { entity: { contains: search, mode: "insensitive" } },
      { admin: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
      include: {
        admin: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="text"
            name="search"
            placeholder="Search by admin or entity..."
            defaultValue={search}
            className="min-w-0 flex-1 px-3 py-2 rounded-md text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <select
            name="action"
            defaultValue={action}
            className="w-full px-3 py-2 rounded-md text-sm sm:w-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="PUBLISH">Publish</option>
            <option value="SETTINGS_CHANGE">Settings Change</option>
          </select>
          <button type="submit" className="btn-secondary w-full sm:w-auto">Filter</button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Admin</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Action</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Entity</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Entity ID</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 font-medium">{log.admin.name || log.admin.email}</td>
                <td className="p-3">
                  <ActionBadge action={log.action} />
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{log.entity}</td>
                <td className="p-3 font-mono text-xs" style={{ color: "var(--muted)" }}>
                  {log.entity_id ? log.entity_id.substring(0, 12) + "…" : "—"}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {log.created_at.toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={adminPath(`/audit-log?page=${page - 1}${search ? `&search=${search}` : ""}${action ? `&action=${action}` : ""}`)}
              className="btn-secondary text-sm"
            >
              <span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Previous</span>
            </a>
          )}
          <span className="text-sm px-3" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={adminPath(`/audit-log?page=${page + 1}${search ? `&search=${search}` : ""}${action ? `&action=${action}` : ""}`)}
              className="btn-secondary text-sm"
            >
              <span className="inline-flex items-center gap-1">Next<ArrowRight className="h-4 w-4" /></span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    CREATE: { bg: "#16a34a", color: "#fff" },
    UPDATE: { bg: "#2563eb", color: "#fff" },
    DELETE: { bg: "#dc2626", color: "#fff" },
    PUBLISH: { bg: "#9333ea", color: "#fff" },
    SETTINGS_CHANGE: { bg: "#ca8a04", color: "#fff" },
  };
  const s = styles[action] ?? { bg: "#6b7280", color: "#fff" };
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {action}
    </span>
  );
}
