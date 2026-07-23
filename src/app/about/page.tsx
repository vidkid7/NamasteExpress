import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/site-config";
import { canonicalUrl, defaultOpenGraphImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "हाम्रो बारेमा | About Us",
  description:
    "नमस्ते एक्सप्रेसको बारेमा - About NamasteXpress: Nepal's trusted online news portal delivering unbiased, timely news in Nepali and English.",
  alternates: { canonical: canonicalUrl("/about") },
  openGraph: {
    title: "हाम्रो बारेमा | About Us",
    description: "नमस्ते एक्सप्रेसको बारेमा - About NamasteXpress",
    url: canonicalUrl("/about"),
    images: [defaultOpenGraphImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: "हाम्रो बारेमा | About Us",
    description: "नमस्ते एक्सप्रेसको बारेमा - About NamasteXpress",
    images: [defaultOpenGraphImage()],
  },
};

export default async function AboutPage() {
  const config = await getSiteConfig();
  const siteNameNe = config.site_name.ne;
  const siteNameEn = config.site_name.en;
  const addressNe = config.contact_address.ne;
  const addressEn = config.contact_address.en;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-accent">
                गृहपृष्ठ
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground">हाम्रो बारेमा</li>
          </ol>
        </nav>

        <article className="prose max-w-none">
          {/* Nepali */}
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>हाम्रो बारेमा</h1>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>हाम्रो उद्देश्य</h2>
            <p className="text-muted leading-relaxed">
              {siteNameNe} नेपालको एक विश्वसनीय अनलाइन समाचार सेवा हो। हामी
              निष्पक्ष, सत्य र समयमा समाचार प्रदान गर्न प्रतिबद्ध छौं।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>हाम्रो दृष्टिकोण</h2>
            <p className="text-muted leading-relaxed">
              हामी विश्वास गर्छौं कि सही जानकारीमा पहुँच प्रत्येक नागरिकको
              अधिकार हो। हामी समाचारलाई सरल, स्पष्ट र सबैका लागि पहुँचयोग्य
              बनाउने लक्ष्य राख्छौं।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>हाम्रो टोली</h2>
            <p className="text-muted leading-relaxed">
              हाम्रो टोलीमा अनुभवी पत्रकार, सम्पादक, र प्रविधि विज्ञहरू छन्
              जसले दैनिक रूपमा तपाईंसम्म समाचार पुर्‍याउने काम गर्छन्।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>सम्पर्क</h2>
            <ul className="list-none pl-0 text-muted space-y-1">
              {addressNe && <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{addressNe}</li>}
              {config.contact_phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{config.contact_phone}</li>}
              {config.contact_email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{config.contact_email}</li>}
            </ul>
          </section>

          {/* English */}
          <section className="border-t border-border pt-8">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>About Us</h1>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>Our Mission</h2>
            <p className="text-muted leading-relaxed">
              {siteNameEn} is a trusted online news service in Nepal. We are
              committed to delivering unbiased, truthful, and timely news.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>Our Vision</h2>
            <p className="text-muted leading-relaxed">
              We believe access to accurate information is the right of every
              citizen. Our goal is to make news simple, clear, and accessible
              to all.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>Our Team</h2>
            <p className="text-muted leading-relaxed">
              Our team consists of experienced journalists, editors, and
              technology experts who work daily to bring you the news.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>Contact</h2>
            <ul className="list-none pl-0 text-muted space-y-1">
              {addressEn && <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{addressEn}</li>}
              {config.contact_phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{config.contact_phone}</li>}
              {config.contact_email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{config.contact_email}</li>}
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
