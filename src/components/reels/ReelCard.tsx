import Link from "next/link";
import Image from "next/image";
import { Clapperboard, Play, Eye } from "lucide-react";
import { publicContentPath } from "@/lib/public-articles";

interface ReelCardProps {
  slug: string;
  title: string;
  thumbnail?: string | null;
  viewCount: number;
}

export function ReelCard({ slug, title, thumbnail, viewCount }: ReelCardProps) {
  return (
    <Link href={publicContentPath("/reels", slug)} className="group block">
      <div
        className="relative aspect-[9/16] rounded-lg overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--border)" }}
          >
            <Clapperboard className="h-10 w-10" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-6 w-6 ml-1" />
          </div>
        </div>

        {/* Bottom gradient + info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-medium line-clamp-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>{title}</p>
          <p className="text-white/70 text-xs mt-1 inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {viewCount.toLocaleString()} views
          </p>
        </div>
      </div>
    </Link>
  );
}
