import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { Image as ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "फोटो ग्यालेरी",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GalleriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 20;

  const [galleries, total] = await Promise.all([
    prisma.gallery.findMany({
      where: { is_active: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { images: true } },
      },
    }),
    prisma.gallery.count({ where: { is_active: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
          <span className="inline-flex items-center gap-2"><ImageIcon className="h-6 w-6" />फोटो ग्यालेरी</span>
        </h1>

        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                slug={gallery.slug}
                title={gallery.title}
                coverImage={gallery.cover_image}
                imageCount={gallery._count.images}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            कुनै ग्यालेरी भेटिएन
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <a href={`/galleries?page=${page - 1}`} className="btn-secondary text-sm">
                <ArrowLeft className="inline h-3.5 w-3.5" /> अघिल्लो
              </a>
            )}
            <span className="text-sm px-3" style={{ color: "var(--muted)" }}>
              पृष्ठ {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a href={`/galleries?page=${page + 1}`} className="btn-secondary text-sm">
                अर्को <ArrowRight className="inline h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
