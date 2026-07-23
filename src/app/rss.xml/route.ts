import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { publicArticlePath } from "@/lib/public-articles";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://namastexpress.com";

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { published_at: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      published_at: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });

  const items = articles
    .map((article) => {
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}${publicArticlePath(article.slug)}</link>
      <guid isPermaLink="true">${siteUrl}${publicArticlePath(article.slug)}</guid>
      <description><![CDATA[${article.excerpt || ""}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${article.category.name}]]></category>
      ${article.author.name ? `<dc:creator><![CDATA[${article.author.name}]]></dc:creator>` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>समाचार पोर्टल - News Portal</title>
    <link>${siteUrl}</link>
    <description>नेपालको विश्वसनीय अनलाइन समाचार पोर्टल</description>
    <language>ne</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
