import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "कुकी नीति | Cookie Policy",
  description:
    "नमस्ते एक्सप्रेसको कुकी नीति - NamasteXpress Cookie Policy",
};

export default function CookiePolicyPage() {
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
            <li className="font-medium text-foreground">कुकी नीति</li>
          </ol>
        </nav>

        <article className="prose max-w-none">
          {/* Nepali */}
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>कुकी नीति</h1>
            <p className="text-sm text-muted mb-4">
              अन्तिम अपडेट: {new Date().getFullYear()}-०१-०१
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              १. कुकी भनेको के हो?
            </h2>
            <p className="text-muted leading-relaxed">
              कुकीहरू साना टेक्स्ट फाइलहरू हुन् जुन वेबसाइटहरूले तपाईंको
              ब्राउजरमा भण्डारण गर्छन्। यसले हामीलाई तपाईंको अनुभव सुधार गर्न
              मद्दत गर्छ।
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              २. हामीले प्रयोग गर्ने कुकीहरू
            </h2>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>
                <strong>आवश्यक कुकीहरू:</strong> साइट सञ्चालनका लागि अनिवार्य
                (लगइन, सत्र)
              </li>
              <li>
                <strong>विश्लेषण कुकीहरू:</strong> साइट प्रयोग बुझ्नका लागि
              </li>
              <li>
                <strong>विज्ञापन कुकीहरू:</strong> सान्दर्भिक विज्ञापन देखाउनका
                लागि
              </li>
              <li>
                <strong>प्राथमिकता कुकीहरू:</strong> भाषा, थिम जस्ता सेटिङहरू
                सम्झनका लागि
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              ३. कुकी व्यवस्थापन
            </h2>
            <p className="text-muted leading-relaxed">
              तपाईं आफ्नो ब्राउजर सेटिङहरू मार्फत कुकीहरू अक्षम वा मेटाउन
              सक्नुहुन्छ। तर, केही सेवाहरूले कुकीहरू बिना सही रूपमा काम नगर्न
              सक्छन्।
            </p>
          </section>

          {/* English */}
          <section className="border-t border-border pt-8">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-nepali-serif)" }}>Cookie Policy</h1>
            <p className="text-sm text-muted mb-4">
              Last updated: {new Date().getFullYear()}-01-01
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              1. What Are Cookies?
            </h2>
            <p className="text-muted leading-relaxed">
              Cookies are small text files that websites store in your browser.
              They help us improve your experience.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              2. Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-6 text-muted space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for site operation
                (login, sessions)
              </li>
              <li>
                <strong>Analytics Cookies:</strong> To understand site usage
              </li>
              <li>
                <strong>Advertising Cookies:</strong> To show relevant
                advertisements
              </li>
              <li>
                <strong>Preference Cookies:</strong> To remember settings like
                language and theme
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3" style={{ fontFamily: "var(--font-nepali-serif)" }}>
              3. Managing Cookies
            </h2>
            <p className="text-muted leading-relaxed">
              You can disable or delete cookies through your browser settings.
              However, some services may not function properly without cookies.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
