"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PatroTabs } from "@/components/patro/PatroTabs";
import { useLanguage } from "@/contexts/LanguageContext";

type Rate = { code: string; name: string; name_ne: string; buy: number; sell: number; unit: number };

const FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CHF: "🇨🇭", AUD: "🇦🇺",
  CAD: "🇨🇦", SGD: "🇸🇬", JPY: "🇯🇵", CNY: "🇨🇳", SAR: "🇸🇦",
  QAR: "🇶🇦", THB: "🇹🇭", AED: "🇦🇪", MYR: "🇲🇾", KRW: "🇰🇷", INR: "🇮🇳",
};

export default function ForexPage() {
  const { language } = useLanguage();
  const [rates, setRates] = useState<Rate[]>([]);
  const mn = (ne: string, en: string) => language === "ne" ? ne : en;

  useEffect(() => {
    fetch("/api/v1/finance/exchange-rates")
      .then(r => r.json())
      .then(d => { if (d.success) setRates(d.data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8" style={{ minHeight: "100vh" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}><ArrowLeftRight className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--foreground)", fontFamily: "var(--font-nepali-serif)" }}>
              {mn("विदेशी विनिमय दर", "Foreign Exchange Rates")}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {mn("नेपाल राष्ट्र बैंकको विनिमय दर", "Nepal Rastra Bank exchange rates")}
            </p>
          </div>
        </div>

        <PatroTabs />

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff" }}>
                  <th className="text-left px-4 py-3 font-bold">{mn("मुद्रा", "Currency")}</th>
                  <th className="text-center px-4 py-3 font-bold">{mn("एकाइ", "Unit")}</th>
                  <th className="text-right px-4 py-3 font-bold">{mn("खरिद", "Buy")}</th>
                  <th className="text-right px-4 py-3 font-bold">{mn("बिक्री", "Sell")}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {rates.map(r => (
                  <tr key={r.code} className="transition-colors hover:bg-[var(--surface-alt)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{FLAGS[r.code] ?? "💵"}</span>
                        <div>
                          <p className="font-semibold" style={{ color: "var(--foreground)" }}>{r.code}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {language === "ne" ? r.name_ne : r.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3" style={{ color: "var(--muted)" }}>{r.unit}</td>
                    <td className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.buy.toFixed(2)}
                    </td>
                    <td className="text-right px-4 py-3 font-semibold" style={{ color: "var(--foreground)" }}>
                      {r.sell.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs mt-4 text-center" style={{ color: "var(--muted)" }}>
          {mn("स्रोत: नेपाल राष्ट्र बैंक", "Source: Nepal Rastra Bank")}
        </p>
      </div>
      <Footer />
    </>
  );
}
