import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/admin-path";
import type { ArticleStatus } from "@prisma/client";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    where.status = status as ArticleStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { title_en: { contains: search, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>Articles</h1>
        <Link href={adminPath("/articles/new")} className="btn-primary">
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />New Article</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="search"
            placeholder="Search articles..."
            defaultValue={search}
            className="flex-1 px-3 py-2 rounded-md text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <select
            name="status"
            defaultValue={status}
            className="px-3 py-2 rounded-md text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" className="btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Title</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Category</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Author</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Views</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-3">
                  <Link
                    href={adminPath(`/articles/${article.id}`)}
                    className="hover:underline font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    {article.title.length > 60 ? article.title.substring(0, 60) + "…" : article.title}
                  </Link>
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{article.category.name}</td>
                <td className="p-3">
                  <StatusBadge status={article.status} />
                </td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{article.author.name}</td>
                <td className="p-3" style={{ color: "var(--muted)" }}>{article.view_count.toLocaleString()}</td>
                <td className="p-3" style={{ color: "var(--muted)" }}>
                  {article.created_at.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No articles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={adminPath(`/articles?page=${page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`)}
              className="btn-secondary text-sm"
            >
              <span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Previous</span>
            </Link>
          )}
          <span className="text-sm px-3" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={adminPath(`/articles?page=${page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`)}
              className="btn-secondary text-sm"
            >
              <span className="inline-flex items-center gap-1">Next<ArrowRight className="h-4 w-4" /></span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: "var(--muted)", color: "#fff" },
    PUBLISHED: { bg: "var(--success, #16a34a)", color: "#fff" },
    ARCHIVED: { bg: "var(--warning, #ca8a04)", color: "#fff" },
  };
  const s = styles[status] ?? styles.DRAFT;
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
