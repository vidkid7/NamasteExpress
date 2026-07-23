import { prisma } from "@/lib/prisma";
import { AdminTagForm } from "@/components/admin/AdminTagForm";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { articles: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ट्यागहरू / Tags</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            लेखहरूमा प्रयोग हुने ट्यागहरू व्यवस्थापन गर्नुहोस्
          </p>
        </div>
      </div>

      <AdminTagForm tags={tags} />
    </div>
  );
}
