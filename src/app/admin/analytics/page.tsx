import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/admin-path";
import {
  FileText,
  Eye,
  Users,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const last7days = new Date(today.getTime() - 7 * 86400000);
  const last30days = new Date(today.getTime() - 30 * 86400000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    // Article counts
    totalArticles,
    publishedArticles,
    draftArticles,
    publishedToday,
    publishedThisMonth,
    publishedLastMonth,

    // View counts
    totalViews,
    viewsToday,
    viewsYesterday,
    viewsThisMonth,
    viewsLastMonth,

    // Page views
    pageViewsToday,
    pageViewsYesterday,
    pageViewsThisMonth,
    pageViewsLastMonth,

    // User counts
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,

    // Comments
    totalComments,
    pendingComments,
    approvedComments,
    commentsToday,

    // Top articles by views
    topArticles,

    // Category breakdown
    categoryBreakdown,

    // Recent page views per day (last 7 days)
    recentPageViews,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: today } } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: thisMonthStart } } }),
    prisma.article.count({ where: { status: "PUBLISHED", published_at: { gte: lastMonthStart, lte: lastMonthEnd } } }),

    prisma.article.aggregate({ _sum: { view_count: true } }),
    prisma.article.aggregate({ _sum: { view_count: true }, where: { published_at: { gte: today } } }),
    prisma.article.aggregate({ _sum: { view_count: true }, where: { published_at: { gte: yesterday, lt: today } } }),
    prisma.article.aggregate({ _sum: { view_count: true }, where: { published_at: { gte: thisMonthStart } } }),
    prisma.article.aggregate({ _sum: { view_count: true }, where: { published_at: { gte: lastMonthStart, lte: lastMonthEnd } } }),

    prisma.pageView.count({ where: { created_at: { gte: today } } }),
    prisma.pageView.count({ where: { created_at: { gte: yesterday, lt: today } } }),
    prisma.pageView.count({ where: { created_at: { gte: thisMonthStart } } }),
    prisma.pageView.count({ where: { created_at: { gte: lastMonthStart, lte: lastMonthEnd } } }),

    prisma.user.count(),
    prisma.user.count({ where: { created_at: { gte: today } } }),
    prisma.user.count({ where: { created_at: { gte: last7days } } }),
    prisma.user.count({ where: { created_at: { gte: thisMonthStart } } }),

    prisma.comment.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.comment.count({ where: { created_at: { gte: today } } }),

    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { view_count: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        view_count: true,
        comment_count: true,
        published_at: true,
        category: { select: { name: true, color: true } },
      },
    }),

    prisma.category.findMany({
      include: {
        _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { articles: { _count: "desc" } },
      take: 8,
    }),

    // Last 7 days page views grouped by day
    prisma.pageView.findMany({
      where: { created_at: { gte: last7days } },
      select: { created_at: true },
      orderBy: { created_at: "asc" },
    }),
  ]);

  // Group page views by day
  const viewsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    viewsByDay[key] = 0;
  }
  for (const pv of recentPageViews) {
    const key = pv.created_at.toISOString().split("T")[0];
    if (key in viewsByDay) viewsByDay[key]++;
  }

  return {
    articles: { total: totalArticles, published: publishedArticles, draft: draftArticles, today: publishedToday, thisMonth: publishedThisMonth, lastMonth: publishedLastMonth },
    views: {
      total: totalViews._sum.view_count ?? 0,
      today: viewsToday._sum.view_count ?? 0,
      yesterday: viewsYesterday._sum.view_count ?? 0,
      thisMonth: viewsThisMonth._sum.view_count ?? 0,
      lastMonth: viewsLastMonth._sum.view_count ?? 0,
    },
    pageViews: { today: pageViewsToday, yesterday: pageViewsYesterday, thisMonth: pageViewsThisMonth, lastMonth: pageViewsLastMonth },
    users: { total: totalUsers, today: newUsersToday, thisWeek: newUsersThisWeek, thisMonth: newUsersThisMonth },
    comments: { total: totalComments, pending: pendingComments, approved: approvedComments, today: commentsToday },
    topArticles,
    categoryBreakdown,
    viewsByDay,
  };
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const pct = pctChange(current, previous);
  const up = pct >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        background: up ? "var(--success-light)" : "var(--error-light)",
        color: up ? "var(--success)" : "var(--error)",
      }}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {Math.abs(pct)}%
    </span>
  );
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();

  const maxViews = Math.max(...Object.values(data.viewsByDay), 1);
  const dayLabels = Object.keys(data.viewsByDay);

  const maxCatArticles = Math.max(...data.categoryBreakdown.map((c) => c._count.articles), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">विश्लेषण / Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            साइटको प्रदर्शन र तथ्याङ्कहरू
          </p>
        </div>
        <Link href={adminPath()} className="btn-secondary btn-sm"><span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />ड्यासबोर्ड</span></Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "कुल लेखहरू", labelEn: "Total Articles",
            value: data.articles.total.toLocaleString(),
            sub: `${data.articles.published} प्रकाशित · ${data.articles.draft} ड्राफ्ट`,
            icon: <FileText className="h-6 w-6" />, color: "var(--primary)",
            trend: <TrendBadge current={data.articles.thisMonth} previous={data.articles.lastMonth} />,
            href: adminPath("/articles"),
          },
          {
            label: "कुल हेराइ", labelEn: "Total Views",
            value: data.views.total.toLocaleString(),
            sub: `आज: ${data.views.today.toLocaleString()}`,
            icon: <Eye className="h-6 w-6" />, color: "var(--accent)",
            trend: <TrendBadge current={data.views.thisMonth} previous={data.views.lastMonth} />,
            href: "#",
          },
          {
            label: "प्रयोगकर्ताहरू", labelEn: "Users",
            value: data.users.total.toLocaleString(),
            sub: `यो हप्ता: +${data.users.thisWeek}`,
            icon: <Users className="h-6 w-6" />, color: "var(--success)",
            trend: <TrendBadge current={data.users.thisMonth} previous={data.users.thisMonth > 0 ? Math.max(1, data.users.thisMonth - data.users.thisWeek) : 1} />,
            href: adminPath("/users"),
          },
          {
            label: "टिप्पणीहरू", labelEn: "Comments",
            value: data.comments.total.toLocaleString(),
            sub: `${data.comments.pending} पेन्डिङ`,
            icon: <MessageSquare className="h-6 w-6" />, color: "var(--warning)",
            trend: <TrendBadge current={data.comments.today} previous={0} />,
            href: adminPath("/comments"),
          },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="card p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate" style={{ color: "var(--muted)" }}>
                  {card.label}
                  <span className="hidden sm:inline text-[10px] ml-1 opacity-60">/ {card.labelEn}</span>
                </p>
                <p className="text-2xl font-bold mt-0.5 tabular-nums">{card.value}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{card.sub}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-2xl">{card.icon}</span>
                {card.trend}
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full" style={{ background: "var(--surface-alt)" }}>
              <div className="h-1 rounded-full w-2/3 transition-all" style={{ background: card.color }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Page Views Chart + Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Page views last 7 days */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold mb-4">पेज भ्युज — पछिल्लो ७ दिन</h2>
          <div className="flex items-end gap-2 h-32">
            {dayLabels.map((day) => {
              const val = data.viewsByDay[day];
              const heightPct = (val / maxViews) * 100;
              const label = new Date(day).toLocaleDateString("ne-NP", { weekday: "short" });
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px]" style={{ color: "var(--muted)" }}>{val}</span>
                  <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(4, heightPct)}%`, background: "var(--primary)" }} />
                  <span className="text-[9px]" style={{ color: "var(--muted)" }}>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: "var(--surface-alt)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>आजको पेज भ्युज</p>
              <p className="text-xl font-bold tabular-nums">{data.pageViews.today.toLocaleString()}</p>
              <TrendBadge current={data.pageViews.today} previous={data.pageViews.yesterday} />
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--surface-alt)" }}>
              <p className="text-xs" style={{ color: "var(--muted)" }}>यो महिना</p>
              <p className="text-xl font-bold tabular-nums">{data.pageViews.thisMonth.toLocaleString()}</p>
              <TrendBadge current={data.pageViews.thisMonth} previous={data.pageViews.lastMonth} />
            </div>
          </div>
        </div>

        {/* Article Stats */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4">लेख तथ्याङ्क</h2>
          <div className="space-y-3">
            {[
              { label: "आज प्रकाशित", value: data.articles.today, color: "var(--success)" },
              { label: "यो महिना", value: data.articles.thisMonth, color: "var(--primary)", compare: data.articles.lastMonth },
              { label: "कुल प्रकाशित", value: data.articles.published, color: "var(--accent)" },
              { label: "ड्राफ्ट", value: data.articles.draft, color: "var(--warning)" },
              { label: "आजका भ्युज", value: data.views.today, color: "var(--info)" },
              { label: "आजका टिप्पणी", value: data.comments.today, color: "var(--muted)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-sm truncate" style={{ color: "var(--muted)" }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tabular-nums">{item.value.toLocaleString()}</span>
                  {item.compare !== undefined && (
                    <TrendBadge current={item.value} previous={item.compare} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown + User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">वर्ग अनुसार लेखहरू</h2>
            <Link href={adminPath("/categories")} className="text-xs" style={{ color: "var(--accent)" }}>
              हेर्नुहोस् <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.categoryBreakdown.map((cat) => {
              const pct = Math.round((cat._count.articles / maxCatArticles) * 100);
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
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
            {data.categoryBreakdown.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>कुनै डाटा छैन</p>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="card p-5">
          <h2 className="text-base font-semibold mb-4">प्रयोगकर्ता वृद्धि</h2>
          <div className="space-y-3">
            {[
              { label: "कुल प्रयोगकर्ताहरू", value: data.users.total, highlight: true },
              { label: "आज नया दर्ता", value: data.users.today },
              { label: "यो हप्ता नया", value: data.users.thisWeek },
              { label: "यो महिना नया", value: data.users.thisMonth },
            ].map((u) => (
              <div
                key={u.label}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: u.highlight ? "var(--primary-light)" : "var(--surface-alt)" }}
              >
                <span className="text-sm" style={{ color: "var(--muted)" }}>{u.label}</span>
                <span className="text-base font-bold tabular-nums">{u.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Comment breakdown */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-sm font-semibold mb-3">टिप्पणी स्थिति</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "स्वीकृत", value: data.comments.approved, color: "var(--success)" },
                { label: "पेन्डिङ", value: data.comments.pending, color: "var(--warning)" },
                { label: "आजका", value: data.comments.today, color: "var(--primary)" },
              ].map((c) => (
                <div key={c.label} className="text-center p-2 rounded-lg" style={{ background: "var(--surface-alt)" }}>
                  <p className="text-lg font-bold tabular-nums" style={{ color: c.color }}>{c.value}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Articles */}
      <div className="card">
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold">सबैभन्दा धेरै हेरिएका लेखहरू</h2>
          <Link href={adminPath("/articles")} className="text-xs" style={{ color: "var(--accent)" }}>
            सबै हेर्नुहोस् <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>#</th>
                <th>शीर्षक</th>
                <th>वर्ग</th>
                <th>भ्युज</th>
                <th>टिप्पणी</th>
                <th>मिति</th>
              </tr>
            </thead>
            <tbody>
              {data.topArticles.map((article, i) => (
                <tr key={article.id}>
                  <td>
                    <span className="font-bold text-sm" style={{ color: "var(--muted)" }}>#{i + 1}</span>
                  </td>
                  <td>
                    <Link
                      href={adminPath(`/articles/${article.id}`)}
                      className="hover:underline font-medium text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      {article.title.length > 55 ? article.title.substring(0, 55) + "…" : article.title}
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
                  <td className="font-bold tabular-nums">{article.view_count.toLocaleString()}</td>
                  <td style={{ color: "var(--muted)" }}>{article.comment_count}</td>
                  <td style={{ color: "var(--muted)" }}>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("ne-NP")
                      : "—"}
                  </td>
                </tr>
              ))}
              {data.topArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center" style={{ color: "var(--muted)" }}>
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
