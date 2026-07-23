import type { Metadata } from "next";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "खेलकुद | Sports",
  description:
    "खेलकुद समाचार, लाइभ स्कोर, टोर्नामेन्ट अपडेट र म्याच परिणामहरू — Sports news, live scores, tournament updates and match results from Nepal and around the world.",
  alternates: { canonical: canonicalUrl("/sports") },
  openGraph: {
    title: "खेलकुद | Sports",
    description:
      "खेलकुद समाचार, लाइभ स्कोर, टोर्नामेन्ट अपडेट र म्याच परिणामहरू",
    url: canonicalUrl("/sports"),
    images: [defaultOpenGraphImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "खेलकुद | Sports",
    description:
      "खेलकुद समाचार, लाइभ स्कोर, टोर्नामेन्ट अपडेट र म्याच परिणामहरू",
    images: [defaultOpenGraphImage()],
  },
};

export default function SportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
