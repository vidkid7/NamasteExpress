"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowLeftRight, Coins, Lightbulb } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { toNepaliDigits } from "@/contexts/LanguageContext";

interface ExchangeRate {
  code: string;
  name: string;
  name_ne: string;
  buy: number;
  sell: number;
  unit: number;
}

interface GoldSilverData {
  gold: { tola_24k: number; tola_22k: number; gram_24k: number; international_oz_usd?: number };
  silver: { tola: number; gram: number; international_oz_usd?: number };
}

// Currency flag emoji mapping
const FLAG_MAP: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", INR: "🇮🇳", AUD: "🇦🇺",
  CAD: "🇨🇦", SGD: "🇸🇬", JPY: "🇯🇵", CHF: "🇨🇭", CNY: "🇨🇳",
};

export default function FinancePage() {
  const { language } = useLanguage();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [goldSilver, setGoldSilver] = useState<GoldSilverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/finance/exchange-rates").then((r) => r.json()),
      fetch("/api/v1/finance/gold-silver").then((r) => r.json()),
    ]).then(([rateRes, gsRes]) => {
      if (rateRes.success) setRates(rateRes.data);
      if (gsRes.success) setGoldSilver(gsRes.data);
      setLastUpdate(new Date().toLocaleTimeString());
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number | null | undefined) => {
    if (typeof n !== "number" || Number.isNaN(n)) return "—";
    return language === "ne" ? toNepaliDigits(n) : n.toLocaleString();
  };
  const fmtDec = (n: number | null | undefined, decimals = 2) => {
    if (typeof n !== "number" || Number.isNaN(n)) return "—";
    return (
    language === "ne"
      ? toNepaliDigits(parseFloat(n.toFixed(decimals)))
      : n.toFixed(decimals)
    );
  };

  return (
    <>
      <Header />
      <div style={{ background: "var(--background)", minHeight: "100vh" }}>
        {/* Hero */}
        <div className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1, #01579b)" }}>
          <div className="mx-auto max-w-7xl px-4 py-8 text-white relative">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8" />
              <h1 className="text-xl sm:text-2xl font-black" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                {language === "ne" ? "वित्तीय बजार" : "Financial Market"}
              </h1>
            </div>
            <p className="text-sm opacity-80">
              {language === "ne"
                ? "नेपाल राष्ट्र बैंकको विदेशी विनिमय दर, सुन-चाँदीको मूल्य र बजार जानकारी"
                : "Nepal Rastra Bank Forex Rates, Gold & Silver Prices and Market Information"}
            </p>
            {lastUpdate && (
              <p className="text-xs mt-1 opacity-60">
                {language === "ne" ? "अन्तिम अपडेट:" : "Last updated:"} {lastUpdate}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl p-6 animate-pulse" style={{ background: "var(--surface)" }}>
                  <div className="h-6 w-48 rounded skeleton mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((j) => <div key={j} className="h-10 rounded skeleton" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Exchange Rates */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="px-6 py-4 text-white"
                  style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)" }}>
                  <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                    <ArrowLeftRight className="h-5 w-5" />
                    {language === "ne" ? "नेपाल राष्ट्र बैंक — विदेशी विनिमय दर" : "Nepal Rastra Bank — Foreign Exchange Rates"}
                  </h2>
                  <p className="text-xs opacity-70 mt-1">
                    {language === "ne" ? "दर नेपाली रुपैयाँमा" : "Rates in Nepali Rupees (NPR)"}
                  </p>
                </div>
                <div className="overflow-x-auto" style={{ background: "var(--surface)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "var(--surface-alt)", borderBottom: "2px solid var(--border)" }}>
                        <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                          {language === "ne" ? "मुद्रा" : "Currency"}
                        </th>
                        <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell" style={{ color: "var(--foreground)" }}>
                          {language === "ne" ? "नाम" : "Name"}
                        </th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                          {language === "ne" ? "एकाइ" : "Unit"}
                        </th>
                        <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                          {language === "ne" ? "खरिद" : "Buy"}
                        </th>
                        <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                          {language === "ne" ? "बिक्री" : "Sell"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.map((rate) => (
                        <tr key={rate.code}
                          style={{ borderBottom: "1px solid var(--border)" }}
                          className="transition-colors hover:bg-[var(--primary-light)]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{FLAG_MAP[rate.code] ?? "🌐"}</span>
                              <span className="font-bold text-sm" style={{ color: "var(--primary)" }}>
                                {rate.code}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-sm" style={{ color: "var(--muted)" }}>
                            {language === "ne" ? rate.name_ne : rate.name}
                          </td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: "var(--muted)" }}>
                            {rate.unit}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--success)" }}>
                            {fmtDec(rate.buy)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>
                            {fmtDec(rate.sell)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 text-xs" style={{ background: "var(--surface-alt)", color: "var(--muted)" }}>
                  {language === "ne"
                    ? "स्रोत: नेपाल राष्ट्र बैंक। दर संकेत मात्र हुन्।"
                    : "Source: Nepal Rastra Bank. Rates are indicative only."}
                </div>
              </div>

              {/* Gold & Silver */}
              {goldSilver && (
                <div id="gold" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gold */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <div className="px-6 py-4 text-white"
                      style={{ background: "linear-gradient(135deg, #f9a825, #e65100)" }}>
                      <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                        <Coins className="h-5 w-5" />
                        {language === "ne" ? "सुनको दर" : "Gold Rate"}
                      </h2>
                    </div>
                    <div className="p-6 space-y-4" style={{ background: "var(--surface)" }}>
                      {[
                        { label_ne: "२४ क्यारेट (तोला)", label_en: "24 Carat (per Tola)", value: goldSilver.gold.tola_24k },
                        { label_ne: "२२ क्यारेट (तोला)", label_en: "22 Carat (per Tola)", value: goldSilver.gold.tola_22k },
                        { label_ne: "२४ क्यारेट (ग्राम)", label_en: "24 Carat (per Gram)", value: goldSilver.gold.gram_24k },
                        { label_ne: "अन्तर्राष्ट्रिय (प्रति औंस, USD)", label_en: "International (per oz, USD)", value: goldSilver.gold.international_oz_usd, prefix: "$" },
                      ].filter((row) => typeof row.value === "number").map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                          <span className="text-sm" style={{ color: "var(--muted)" }}>
                            {language === "ne" ? row.label_ne : row.label_en}
                          </span>
                          <span className="font-bold text-base" style={{ color: "#f9a825" }}>
                            {row.prefix ?? (language === "ne" ? "रु." : "Rs.")}{" "}
                            {fmt(row.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <div className="px-6 py-4 text-white"
                      style={{ background: "linear-gradient(135deg, #90a4ae, #546e7a)" }}>
                      <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-nepali-serif)" }}>
                        <Coins className="h-5 w-5" />
                        {language === "ne" ? "चाँदीको दर" : "Silver Rate"}
                      </h2>
                    </div>
                    <div className="p-6 space-y-4" style={{ background: "var(--surface)" }}>
                      {[
                        { label_ne: "चाँदी (तोला)", label_en: "Silver (per Tola)", value: goldSilver.silver.tola },
                        { label_ne: "चाँदी (ग्राम)", label_en: "Silver (per Gram)", value: goldSilver.silver.gram },
                        { label_ne: "अन्तर्राष्ट्रिय (प्रति औंस, USD)", label_en: "International (per oz, USD)", value: goldSilver.silver.international_oz_usd, prefix: "$", decimal: true },
                      ].filter((row) => typeof row.value === "number").map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                          <span className="text-sm" style={{ color: "var(--muted)" }}>
                            {language === "ne" ? row.label_ne : row.label_en}
                          </span>
                          <span className="font-bold text-base" style={{ color: "#90a4ae" }}>
                            {row.prefix ?? (language === "ne" ? "रु." : "Rs.")}{" "}
                            {row.decimal ? fmtDec(row.value) : fmt(row.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-xl p-4 text-center text-sm flex items-center justify-center gap-2"
                style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                <Lightbulb className="h-4 w-4 shrink-0" />
                {language === "ne"
                  ? "सुन-चाँदीको मूल्य नेपाल सुनकारी व्यवसायी महासंघको आधारमा अनुमानित हो। वास्तविक किनबेचमा फरक हुन सक्छ।"
                  : "Gold/silver prices are indicative based on Nepal Goldsmiths Federation. Actual prices may vary."}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
