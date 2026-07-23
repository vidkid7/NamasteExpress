import type { Metadata, Viewport } from "next";
import { Noto_Serif_Devanagari, Noto_Sans_Devanagari, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-nepali-serif",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-nepali",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "नमस्ते एक्सप्रेस - विश्वसनीय समाचार सेवा",
    template: "%s | नमस्ते एक्सप्रेस",
  },
  description: "नेपालको विश्वसनीय अनलाइन समाचार पोर्टल — ताजा समाचार, राजनीति, खेलकुद, व्यापार, मनोरञ्जन",
  keywords: ["news", "nepal", "nepali news", "समाचार", "नेपाल", "ताजा समाचार", "namaste express", "namastexpress"],
  authors: [{ name: "नमस्ते एक्सप्रेस" }],
  creator: "नमस्ते एक्सप्रेस",
  openGraph: {
    type: "website",
    locale: "ne_NP",
    siteName: "नमस्ते एक्सप्रेस",
    title: "नमस्ते एक्सप्रेस - विश्वसनीय समाचार सेवा",
    description: "नेपालको विश्वसनीय अनलाइन समाचार पोर्टल",
  },
  twitter: {
    card: "summary_large_image",
    title: "नमस्ते एक्सप्रेस - विश्वसनीय समाचार सेवा",
    description: "नेपालको विश्वसनीय अनलाइन समाचार पोर्टल",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icons/logo.jpeg",
    apple: "/icons/logo.jpeg",
    shortcut: "/icons/logo.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

// FOUC prevention script - runs before React hydration
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme !== 'light' && theme !== 'dark') theme = 'light';
      document.documentElement.dataset.theme = theme;
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ne"
      data-scroll-behavior="smooth"
      className={`${notoSerifDevanagari.variable} ${notoSansDevanagari.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/icons/logo.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/icons/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/icons/logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c30000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
      </head>
      <body className="min-h-full flex flex-col">
        <LoadingScreen splash minDisplayMs={0} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
