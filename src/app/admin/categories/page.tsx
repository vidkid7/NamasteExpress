import { prisma } from "@/lib/prisma";
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: "asc" },
    include: {
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-nepali-serif)" }}>Categories</h1>
      </div>

      <AdminCategoryManager categories={categories} />
    </div>
  );
}
