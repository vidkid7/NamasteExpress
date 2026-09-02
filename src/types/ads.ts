export interface PublicAd {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string;
  position: {
    type: string;
    width?: number | null;
    height?: number | null;
  };
}
