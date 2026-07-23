import { prisma } from "@/lib/prisma";
import { AdminCommentActions } from "@/components/admin/AdminCommentActions";
import { adminPath } from "@/lib/admin-path";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status && ["PENDING", "APPROVED", "REJECTED", "SPAM"].includes(status)) {
    where.status = status;
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
      include: {
        article: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>Comments</h1>

      {/* Filter */}
      <div className="card p-4">
        <form className="flex flex-col gap-3 sm:flex-row">
          <select
            name="status"
            defaultValue={status}
            className="w-full px-3 py-2 rounded-md text-sm sm:w-auto"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SPAM">Spam</option>
          </select>
          <button type="submit" className="btn-secondary w-full sm:w-auto">Filter</button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Content</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Article</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>User</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3 max-w-xs truncate">
                  {comment.content.length > 80 ? comment.content.substring(0, 80) + "…" : comment.content}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {comment.article.title.length > 40
                    ? comment.article.title.substring(0, 40) + "…"
                    : comment.article.title}
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {comment.user.name || comment.user.email}
                </td>
                <td className="p-3">
                  <CommentStatusBadge status={comment.status} />
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {comment.created_at.toLocaleDateString()}
                </td>
                <td className="p-3">
                  <AdminCommentActions commentId={comment.id} currentStatus={comment.status} />
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No comments found
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
              href={adminPath(`/comments?page=${page - 1}${status ? `&status=${status}` : ""}`)}
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
              href={adminPath(`/comments?page=${page + 1}${status ? `&status=${status}` : ""}`)}
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

function CommentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "var(--warning, #ca8a04)", color: "#fff" },
    APPROVED: { bg: "var(--success, #16a34a)", color: "#fff" },
    REJECTED: { bg: "var(--error, #dc2626)", color: "#fff" },
    SPAM: { bg: "var(--muted, #6b7280)", color: "#fff" },
  };
  const s = styles[status] ?? styles.PENDING;
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
