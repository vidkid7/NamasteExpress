import type { ArticleStatus, Prisma } from "@prisma/client";

type PublicArticleFilterInput = {
  category?: string | null;
  status?: string | null;
  search?: string | null;
};

type ArticleVisibilityUpdateInput = {
  status?: ArticleStatus;
  is_featured?: boolean;
  published_at?: Date | null;
  [key: string]: unknown;
};

type ActiveContentListInput = {
  includeInactive?: boolean;
  canManage?: boolean;
};

export function publicArticlePath(slug: string) {
  return publicContentPath("/articles", slug);
}

export function publicContentPath(basePath: string, slug: string) {
  return `${basePath}/${encodeURIComponent(slug)}`;
}

export function decodePublicSlugParam(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export const decodeArticleSlugParam = decodePublicSlugParam;

export function buildPublicArticleWhere({
  category,
  search,
}: PublicArticleFilterInput): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = { status: "PUBLISHED" };

  if (category) {
    where.category_id = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildPublishedArticleByIdWhere(id: string): Prisma.ArticleWhereUniqueInput {
  return { id, status: "PUBLISHED" };
}

export function buildActiveContentByIdWhere(id: string) {
  return { id, is_active: true };
}

export function buildActiveContentListWhere({
  includeInactive,
  canManage,
}: ActiveContentListInput) {
  return includeInactive && canManage ? {} : { is_active: true };
}

export function buildPublicBreakingNewsWhere(now = new Date()): Prisma.BreakingNewsWhereInput {
  return {
    is_active: true,
    AND: [
      { OR: [{ expires_at: null }, { expires_at: { gt: now } }] },
      { OR: [{ article_id: null }, { article: { status: "PUBLISHED" } }] },
    ],
  };
}

export function buildArticleVisibilityUpdateData<T extends ArticleVisibilityUpdateInput>(
  existingStatus: ArticleStatus,
  updateData: T
): T & { is_featured?: boolean; published_at?: Date | null } {
  const data = { ...updateData };

  if (data.status === "PUBLISHED" && existingStatus !== "PUBLISHED") {
    data.published_at = new Date();
  }

  if (data.status && data.status !== "PUBLISHED") {
    data.is_featured = false;
    data.published_at = null;
  }

  return data;
}
