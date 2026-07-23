"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Coins, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExchangeRate {
  code: string;
  name: string;
  name_ne: string;
  buy: number;
  sell: number;
  unit: number;
}

interface GoldSilverData {
  gold: { tola_24k: number; tola_22k: number; gram_24k: number; international_oz_usd: number };
  silver: { tola: number; gram: number; international_oz_usd: number };
}

const MAIN_CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD"];

export function FinanceWidget() {
  const { language } = useLanguage();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [goldSilver, setGoldSilver] = useState<GoldSilverData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/finance/exchange-rates").then((r) => r.json()),
      fetch("/api/v1/finance/gold-silver").then((r) => r.json()),
    ]).then(([rateRes, gsRes]) => {
      if (rateRes.success) setRates(rateRes.data.filter((r: ExchangeRate) => MAIN_CURRENCIES.includes(r.code)));
      if (gsRes.success) setGoldSilver(gsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="h-5 w-32 rounded skeleton mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded skeleton" />)}
        </div>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("en-NP");

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Exchange Rates */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #1565c0, #0d47a1)", color: "#fff" }}>
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          {language === "ne" ? "विनिमय दर" : "Exchange Rates"}
        </h3>
        <Link href="/finance" className="text-xs opacity-80 hover:opacity-100 inline-flex items-center gap-1">
          {language === "ne" ? "सबै" : "All"}
          <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {rates.map((rate) => (
          <div key={rate.code} className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="w-8 text-xs font-bold px-1 py-0.5 rounded text-center"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                {rate.code}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {rate.unit > 1 ? `${rate.unit} ` : ""}
                {language === "ne" ? rate.name_ne : rate.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {language === "ne" ? "रु." : "Rs."} {fmt(rate.buy)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gold / Silver */}
      {goldSilver && (
        <>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #f9a825, #e65100)", color: "#fff" }}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {language === "ne" ? "सुन-चाँदी दर" : "Gold & Silver"}
            </h3>
            <Link href="/finance#gold" className="text-xs opacity-80 hover:opacity-100 inline-flex items-center gap-1">
              {language === "ne" ? "सबै" : "All"}
              <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {language === "ne" ? "सुन (२४क)" : "Gold (24K)"}
                </span>
                <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>
                  / {language === "ne" ? "तोला" : "Tola"}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: "#f9a825" }}>
                {language === "ne" ? "रु." : "Rs."} {fmt(goldSilver.gold.tola_24k)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {language === "ne" ? "सुन (२२क)" : "Gold (22K)"}
                </span>
                <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>
                  / {language === "ne" ? "तोला" : "Tola"}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: "#f9a825" }}>
                {language === "ne" ? "रु." : "Rs."} {fmt(goldSilver.gold.tola_22k)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {language === "ne" ? "चाँदी" : "Silver"}
                </span>
                <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>
                  / {language === "ne" ? "तोला" : "Tola"}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: "#90a4ae" }}>
                {language === "ne" ? "रु." : "Rs."} {fmt(goldSilver.silver.tola)}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="px-4 py-2 text-center" style={{ background: "var(--surface-alt)" }}>
        <Link href="/finance" className="text-xs font-semibold hover:underline inline-flex items-center gap-1" style={{ color: "var(--primary)" }}>
          {language === "ne" ? "पूर्ण वित्तीय डाटा हेर्नुहोस्" : "View Full Financial Data"}
          <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
