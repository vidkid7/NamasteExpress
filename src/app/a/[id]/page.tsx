import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { publicArticlePath, buildPublishedArticleByIdWhere } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

interface ShortArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortArticlePage({ params }: ShortArticlePageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: buildPublishedArticleByIdWhere(decodeURIComponent(id)),
    select: { slug: true },
  });

  if (!article) notFound();
  redirect(publicArticlePath(article.slug));
}
