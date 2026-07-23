import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditArticleForm } from "./EditArticleForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    }),
    prisma.category.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <EditArticleForm
      article={article}
      categories={categories}
      tags={tags}
    />
  );
}
