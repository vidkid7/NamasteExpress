"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LightboxViewer } from "@/components/gallery/LightboxViewer";
import { decodePublicSlugParam } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string | null;
}

interface GalleryData {
  id: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  images: GalleryImage[];
}

export default function GallerySlugPage() {
  const params = useParams();
  const slug = decodePublicSlugParam(params.slug as string);
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    // Find gallery by slug - we fetch all and filter, or use API
    async function load() {
      try {
        // First get all galleries to find the ID by slug
        const listRes = await fetch("/api/v1/galleries?pageSize=50");
        const listJson = await listRes.json();
        if (!listJson.success) return;

        const found = listJson.data.data?.find(
          (g: { slug: string }) => g.slug === slug
        );
        if (!found) return;

        const res = await fetch(`/api/v1/galleries/${found.id}`);
        const json = await res.json();
        if (json.success) setGallery(json.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            लोड हुँदैछ...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!gallery) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            ग्यालेरी भेटिएन
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
            {gallery.title}
          </h1>
          {gallery.title_en && (
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {gallery.title_en}
            </p>
          )}
          {gallery.description && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {gallery.description}
            </p>
          )}
        </div>

        {gallery.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                style={{ background: "var(--border)" }}
              >
                <img
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs line-clamp-2">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            कुनै फोटो छैन
          </div>
        )}
      </main>
      <Footer />

      {lightboxIndex !== null && (
        <LightboxViewer
          images={gallery.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
