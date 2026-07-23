import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "सेवा सर्तहरू | Terms of Service",
  description:
    "नमस्ते एक्सप्रेसको सेवा सर्तहरू - NamasteXpress Terms of Service",
};

export default async function TermsOfServicePage() {
  const config = await getSiteConfig();
  const siteNameNe = config.site_name.ne;
  const siteNameEn = config.site_name.en;

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
            <li className="font-medium text-foreground">सेवा सर्तहरू</li>
          </ol>
        </nav>

        <article className="prose max-w-none">
          {/* Nepali */}
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>सेवा सर्तहरू</h1>
            <p className="text-sm text-muted mb-4">
              अन्तिम अपडेट: {new Date().getFullYear()}-०१-०१
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              १. सेवाको स्वीकृति
            </h2>
            <p className="text-muted leading-relaxed">
              {siteNameNe}को प्रयोग गरेर, तपाईंले यी सेवा सर्तहरू स्वीकार
              गर्नुभएको मानिन्छ। यदि तपाईं यी सर्तहरूसँग सहमत हुनुहुन्न भने,
              कृपया हाम्रो सेवा प्रयोग नगर्नुहोस्।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              २. प्रयोगकर्ताको दायित्व
            </h2>
            <ul className="list-disc pl-6 text-muted space-y-1">
              <li>सत्य र सही जानकारी प्रदान गर्ने</li>
              <li>अरूको बौद्धिक सम्पत्तिको सम्मान गर्ने</li>
              <li>गैरकानूनी गतिविधिमा संलग्न नहुने</li>
              <li>स्प्याम वा हानिकारक सामग्री पोस्ट नगर्ने</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              ३. बौद्धिक सम्पत्ति
            </h2>
            <p className="text-muted leading-relaxed">
              यस साइटमा प्रकाशित सबै सामग्री {siteNameNe}को सम्पत्ति हो।
              लिखित अनुमति बिना पुनः प्रकाशन गर्न निषेध छ।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              ४. दायित्वको सीमा
            </h2>
            <p className="text-muted leading-relaxed">
              {siteNameNe}ले सेवाको प्रयोगबाट उत्पन्न हुने कुनै पनि हानि वा
              क्षतिको लागि जिम्मेवार हुने छैन।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              ५. सम्पर्क
            </h2>
            {config.contact_email && (
              <p className="text-muted">सेवा सर्त सम्बन्धी प्रश्नका लागि: {config.contact_email}</p>
            )}
          </section>

          {/* English */}
          <section className="border-t border-border pt-8">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>Terms of Service</h1>
            <p className="text-sm text-muted mb-4">
              Last updated: {new Date().getFullYear()}-01-01
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-muted leading-relaxed">
              By using {siteNameEn}, you agree to these Terms of Service. If you
              do not agree with these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              2. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 text-muted space-y-1">
              <li>Provide truthful and accurate information</li>
              <li>Respect others&apos; intellectual property</li>
              <li>Do not engage in illegal activities</li>
              <li>Do not post spam or harmful content</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              3. Intellectual Property
            </h2>
            <p className="text-muted leading-relaxed">
              All content published on this site is the property of {siteNameEn}.
              Republication without written permission is prohibited.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              4. Limitation of Liability
            </h2>
            <p className="text-muted leading-relaxed">
              {siteNameEn} shall not be liable for any loss or damage arising from
              the use of the service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>5. Contact</h2>
            {config.contact_email && (
              <p className="text-muted">For terms of service inquiries: {config.contact_email}</p>
            )}
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
