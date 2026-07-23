import Link from "next/link";
import Image from "next/image";
import { Image as ImageIcon, Camera } from "lucide-react";
import { publicContentPath } from "@/lib/public-articles";

interface GalleryCardProps {
  slug: string;
  title: string;
  coverImage?: string | null;
  imageCount: number;
}

export function GalleryCard({ slug, title, coverImage, imageCount }: GalleryCardProps) {
  return (
    <Link href={publicContentPath("/galleries", slug)} className="group block">
      <div
        className="relative aspect-[4/3] rounded-lg overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--border)" }}
          >
            <ImageIcon className="h-10 w-10" />
          </div>
        )}

        {/* Image count badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold bg-black/60 text-white inline-flex items-center gap-1">
          <Camera className="h-3.5 w-3.5" /> {imageCount}
        </div>

        {/* Bottom gradient + title */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-semibold line-clamp-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>{title}</p>
        </div>
      </div>
    </Link>
  );
}
