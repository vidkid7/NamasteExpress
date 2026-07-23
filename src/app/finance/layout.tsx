import type { Metadata } from "next";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "वित्तीय बजार | Finance",
  description:
    "नेपाल राष्ट्र बैंकको विदेशी विनिमय दर, सुन-चाँदीको मूल्य र बजार जानकारी — Nepal Rastra Bank Forex Rates, Gold & Silver Prices and Market Information.",
  alternates: { canonical: canonicalUrl("/finance") },
  openGraph: {
    title: "वित्तीय बजार | Finance",
    description:
      "नेपाल राष्ट्र बैंकको विदेशी विनिमय दर, सुन-चाँदीको मूल्य र बजार जानकारी",
    url: canonicalUrl("/finance"),
    images: [defaultOpenGraphImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "वित्तीय बजार | Finance",
    description:
      "नेपाल राष्ट्र बैंकको विदेशी विनिमय दर, सुन-चाँदीको मूल्य र बजार जानकारी",
    images: [defaultOpenGraphImage()],
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
