import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // cache for 60 seconds

const NEPSE_BASE = "https://nepalstock.com.np/api/nots";

const HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://nepalstock.com.np/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

async function fetchNepse<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${NEPSE_BASE}${path}`, {
      headers: HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

interface NepseIndexRaw {
  index?: number | string;
  absoluteChange?: number | string;
  percentageChange?: number | string;
  totalTurnover?: number | string;
  totalSharesTraded?: number | string;
  totalTransactions?: number | string;
  marketCapitalization?: number | string;
  floatedMarketCapitalization?: number | string;
  sensitiveIndex?: number | string;
  sensitiveFloatIndex?: number | string;
  floatIndex?: number | string;
  sensitiveIndexChange?: number | string;
  sensitiveFloatIndexChange?: number | string;
  floatIndexChange?: number | string;
}

interface NepseStockRaw {
  symbol?: string;
  securityName?: string;
  lastTradedPrice?: number | string;
  priceChange?: number | string;
  percentageChange?: number | string;
  totalTradeQuantity?: number | string;
  highPrice?: number | string;
  lowPrice?: number | string;
  openPrice?: number | string;
}

export async function GET() {
  // Attempt to fetch real NEPSE data
  const [indexData, topTrades] = await Promise.all([
    fetchNepse<NepseIndexRaw>("/nepse-data/index"),
    fetchNepse<{ content?: NepseStockRaw[] }>("/top-ten-trade/share"),
  ]);

  if (indexData) {
    const toNum = (v: number | string | undefined, fallback = 0) =>
      v !== undefined && v !== null ? Number(v) : fallback;

    const indices = [
      {
        name: "NEPSE",
        nameNe: "नेप्से",
        value: toNum(indexData.index),
        change: toNum(indexData.absoluteChange),
        pct: toNum(indexData.percentageChange),
      },
      {
        name: "Sensitive",
        nameNe: "सेन्सेटिभ",
        value: toNum(indexData.sensitiveIndex),
        change: toNum(indexData.sensitiveIndexChange),
        pct: 0,
      },
      {
        name: "Float",
        nameNe: "फ्लोट",
        value: toNum(indexData.floatIndex),
        change: toNum(indexData.floatIndexChange),
        pct: 0,
      },
      {
        name: "Sensitive Float",
        nameNe: "सेन्सेटिभ फ्लोट",
        value: toNum(indexData.sensitiveFloatIndex),
        change: toNum(indexData.sensitiveFloatIndexChange),
        pct: 0,
      },
    ];

    const stocks = (topTrades?.content ?? []).map((s) => ({
      symbol: s.symbol ?? "",
      name: s.securityName ?? s.symbol ?? "",
      price: toNum(s.lastTradedPrice),
      change: toNum(s.priceChange),
      pct: toNum(s.percentageChange),
      volume: toNum(s.totalTradeQuantity),
      high: toNum(s.highPrice),
      low: toNum(s.lowPrice),
    }));

    return NextResponse.json(
      { live: true, indices, stocks, lastUpdated: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  }

  return NextResponse.json(
    {
      live: false,
      indices: [],
      stocks: [],
      error: "NEPSE data is temporarily unavailable from nepalstock.com.np",
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
      },
    }
  );
}
