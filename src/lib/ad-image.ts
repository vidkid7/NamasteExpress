export function getAdImageSrc(adId: string, imageUrl: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("https://res.cloudinary.com/")) {
    return `/placements/${encodeURIComponent(adId)}/image`;
  }
  return imageUrl;
}
