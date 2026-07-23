import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReelCard } from "@/components/reels/ReelCard";
import { Clapperboard, ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OK Reels - भिडियो",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReelsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));
  const pageSize = 20;

  const [reels, total] = await Promise.all([
    prisma.reel.findMany({
      where: { is_active: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
    }),
    prisma.reel.count({ where: { is_active: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
          <span className="inline-flex items-center gap-2"><Clapperboard className="h-6 w-6" />OK Reels</span>
        </h1>

        {reels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                slug={reel.slug}
                title={reel.title}
                thumbnail={reel.thumbnail}
                viewCount={reel.view_count}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            कुनै रिल भेटिएन
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <a href={`/reels?page=${page - 1}`} className="btn-secondary text-sm">
                <ArrowLeft className="inline h-3.5 w-3.5" /> अघिल्लो
              </a>
            )}
            <span className="text-sm px-3" style={{ color: "var(--muted)" }}>
              पृष्ठ {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a href={`/reels?page=${page + 1}`} className="btn-secondary text-sm">
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
