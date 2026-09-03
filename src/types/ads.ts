import type { AdSize } from "@/lib/ad-sizes";

export interface PublicAd {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string;
  ad_size?: AdSize | string | null;
  position: {
    type: string;
    width?: number | null;
    height?: number | null;
  };
}
