import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/admin-path";
import { STATUS_COLORS } from "@/lib/utils";
import {
  FileText,
  Eye,
  MessageSquare,
  Megaphone,
  Users,
  Tag,
  Globe,
  Plus,
  Newspaper,
  User,
  Pencil,
  TrendingUp,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59);
  const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalArticles,
    publishedArticles,
    totalViewsResult,
    pendingComments,
    approvedComments,
    activeAds,
    recentUsers,
    newUsersToday,
    publishedToday,
    publishedThisMonth,
    publishedLastMonth,
    totalTags,
    totalCategories,
    pageViewsToday,
    pageViewsYesterday,
    categoryBreakdown,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.aggregate({ _sum: { view_count: true } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.advertisement.count({ where: { is_active: true } }),
    prisma.user.count({ where: { created_at: { gte: last7days } } }),
    prisma.user.count({ where: { created_at: { gte: today } } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: today } } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: thisMonthStart } } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.tag.count(),
    prisma.category.count(),
    prisma.pageView.count({ where: { created_at: { gte: today } } }),
    prisma.pageView.count({ where: { created_at: { gte: new Date(today.getTime() - 86400000), lt: today } } }),
    prisma.category.findMany({
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
      orderBy: { articles: { _count: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalArticles,
    publishedArticles,
    totalViews: totalViewsResult._sum.view_count ?? 0,
    pendingComments,
    approvedComments,
    activeAds,
    recentUsers,
    newUsersToday,
    publishedToday,
    publishedThisMonth,
    publishedLastMonth,
    totalTags,
    totalCategories,
    pageViewsToday,
    pageViewsYesterday,
    categoryBreakdown,
  };
}

async function getRecentArticles() {
  return prisma.article.findMany({
    orderBy: { created_at: "desc" },
    take: 8,
    include: {
      category: { select: { name: true, color: true } },
      author: { select: { name: true } },
    },
  });
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const pct = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        background: up ? "var(--success-light)" : "var(--error-light)",
        color: up ? "var(--success)" : "var(--error)",
      }}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {Math.abs(pct)}%
    </span>
  );
}

export default async function AdminDashboard() {
  const [stats, recentArticles] = await Promise.all([
    getStats(),
    getRecentArticles(),
  ]);

  const maxCat = Math.max(...stats.categoryBreakdown.map((c) => c._count.articles), 1);

  const statCards = [
    { label: "कुल लेखहरू", value: stats.totalArticles, sub: `${stats.publishedArticles} प्रकाशित`, icon: <FileText className="h-5 w-5" />, color: "var(--primary)", href: adminPath("/articles") },
    { label: "कुल भ्युज", value: stats.totalViews.toLocaleString(), sub: `आज: ${stats.pageViewsToday}`, icon: <Eye className="h-5 w-5" />, color: "var(--accent)", href: adminPath("/analytics") },
    { label: "टिप्पणीहरू", value: stats.pendingComments, sub: `${stats.approvedComments} स्वीकृत`, icon: <MessageSquare className="h-5 w-5" />, color: "var(--warning)", href: adminPath("/comments") },
    { label: "विज्ञापन", value: stats.activeAds, sub: "सक्रिय", icon: <Megaphone className="h-5 w-5" />, color: "var(--success)", href: adminPath("/ads") },
    { label: "प्रयोगकर्ता", value: stats.recentUsers, sub: "७ दिनमा नया", icon: <Users className="h-5 w-5" />, color: "var(--info, var(--primary))", href: adminPath("/users") },
    { label: "ट्यागहरू", value: stats.totalTags, sub: `${stats.totalCategories} वर्ग`, icon: <Tag className="h-5 w-5" />, color: "var(--muted)", href: adminPath("/tags") },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>ड्यासबोर्ड</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            स्वागत छ! साइटको अवस्था हेर्नुहोस्।
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn-secondary">
            <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4" />साइट हेर्नुहोस्</span>
          </Link>
          <Link href={adminPath("/articles/new")} className="btn-primary">
            <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />नयाँ लेख</span>
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card p-3 sm:p-4 hover:scale-[1.03] transition-transform"
          >
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--muted)" }}>{card.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums leading-tight break-words">{card.value}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>{card.sub}</p>
              </div>
              <span className="text-xl shrink-0">{card.icon}</span>
            </div>
            <div className="mt-2.5 h-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
              <div className="h-1 rounded-full w-2/3" style={{ background: card.color }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Middle row: Today's snapshot + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today's Activity */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="text-base font-semibold mb-4" style={{ fontFamily: "var(--font-nepali-serif)" }}>आजको गतिविधि</h2>
          <div className="space-y-3">
            {[
              { label: "प्रकाशित लेख", value: stats.publishedToday, icon: <Newspaper className="h-5 w-5" />, color: "var(--primary)" },
              { label: "पेज भ्युज", value: stats.pageViewsToday, icon: <Eye className="h-5 w-5" />, color: "var(--accent)", compare: stats.pageViewsYesterday },
              { label: "नया प्रयोगकर्ता", value: stats.newUsersToday, icon: <User className="h-5 w-5" />, color: "var(--success)" },
              { label: "पेन्डिङ टिप्पणी", value: stats.pendingComments, icon: <MessageSquare className="h-5 w-5" />, color: "var(--warning)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "var(--surface-alt)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tabular-nums">{item.value.toLocaleString()}</span>
                  {item.compare !== undefined && (
                    <TrendBadge current={item.value} previous={item.compare} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">यो महिना vs गत महिना</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg p-2.5 text-center" style={{ background: "var(--primary-light)" }}>
                <p className="text-xs" style={{ color: "var(--muted)" }}>यो महिना</p>
                <p className="text-lg font-bold tabular-nums">{stats.publishedThisMonth}</p>
              </div>
              <TrendBadge current={stats.publishedThisMonth} previous={stats.publishedLastMonth} />
              <div className="flex-1 rounded-lg p-2.5 text-center" style={{ background: "var(--surface-alt)" }}>
                <p className="text-xs" style={{ color: "var(--muted)" }}>गत महिना</p>
                <p className="text-lg font-bold tabular-nums">{stats.publishedLastMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-nepali-serif)" }}>वर्ग अनुसार लेखहरू</h2>
            <Link href={adminPath("/categories")} className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              व्यवस्थापन <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {stats.categoryBreakdown.map((cat) => {
              const pct = Math.round((cat._count.articles / maxCat) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{cat._count.articles}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--surface-alt)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick links */}
          <div className="mt-5 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "नयाँ लेख", href: adminPath("/articles/new"), icon: <Pencil className="h-4 w-4" />, color: "var(--primary)" },
              { label: "विश्लेषण", href: adminPath("/analytics"), icon: <TrendingUp className="h-4 w-4" />, color: "var(--accent)" },
              { label: "सेटिङ", href: adminPath("/settings"), icon: <Settings className="h-4 w-4" />, color: "var(--muted)" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 p-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 border border-border"
                style={{ background: "var(--surface)", color: "var(--foreground)" }}
              >
                <span style={{ color: link.color }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="card">
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-nepali-serif)" }}>हालका लेखहरू</h2>
          <Link href={adminPath("/articles")} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            सबै हेर्नुहोस् <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>शीर्षक</th>
                <th>वर्ग</th>
                <th>स्थिति</th>
                <th>लेखक</th>
                <th>भ्युज</th>
                <th>मिति</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((article) => {
                const statusInfo = STATUS_COLORS[article.status as keyof typeof STATUS_COLORS];
                return (
                  <tr key={article.id}>
                    <td>
                      <Link
                        href={adminPath(`/articles/${article.id}`)}
                        className="hover:underline font-medium"
                        style={{ color: "var(--accent)" }}
                      >
                        {article.title.length > 48 ? article.title.substring(0, 48) + "…" : article.title}
                      </Link>
                    </td>
                    <td>
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                        style={{ background: article.category.color }}
                      >
                        {article.category.name}
                      </span>
                    </td>
                    <td>
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{ background: statusInfo?.bg || "var(--muted)", color: statusInfo?.text || "#fff" }}
                      >
                        {statusInfo?.label || article.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{article.author.name}</td>
                    <td className="font-medium tabular-nums">{article.view_count.toLocaleString()}</td>
                    <td style={{ color: "var(--muted)" }}>
                      {article.created_at.toLocaleDateString("ne-NP")}
                    </td>
                  </tr>
                );
              })}
              {recentArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: "var(--muted)" }}>
                    कुनै लेख भेटिएन
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
