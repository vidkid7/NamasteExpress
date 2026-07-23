import { prisma } from "@/lib/prisma";
import { AdminBreakingNewsForm } from "@/components/admin/AdminBreakingNewsForm";
import { AdminBreakingNewsToggle } from "@/components/admin/AdminBreakingNewsToggle";

export const dynamic = "force-dynamic";

export default async function AdminBreakingNewsPage() {
  const breakingNews = await prisma.breakingNews.findMany({
    orderBy: { created_at: "desc" },
    include: {
      article: { select: { title: true, slug: true } },
    },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Breaking News</h1>

      {/* Create Form */}
      <AdminBreakingNewsForm />

      {/* List */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Title</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Article</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Expires</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Created</th>
              <th className="text-left p-3 font-medium" style={{ color: "var(--muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {breakingNews.map((item) => {
              const expired = item.expires_at && item.expires_at < now;
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="p-3 font-medium">{item.title}</td>
                  <td className="p-3" style={{ color: "var(--muted)" }}>
                    {item.article ? item.article.title.substring(0, 40) : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{
                        background: expired ? "#6b7280" : item.is_active ? "#16a34a" : "#ca8a04",
                        color: "#fff",
                      }}
                    >
                      {expired ? "Expired" : item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3" style={{ color: "var(--muted)" }}>
                    {item.expires_at ? item.expires_at.toLocaleString() : "Never"}
                  </td>
                  <td className="p-3" style={{ color: "var(--muted)" }}>
                    {item.created_at.toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <AdminBreakingNewsToggle
                      id={item.id}
                      isActive={item.is_active}
                      title={item.title}
                      articleId={item.article_id}
                      expiresAt={item.expires_at?.toISOString() ?? null}
                    />
                  </td>
                </tr>
              );
            })}
            {breakingNews.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  No breaking news items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
