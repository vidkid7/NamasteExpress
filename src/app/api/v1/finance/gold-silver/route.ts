import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const latest = await prisma.goldSilverPrice.findFirst({
      orderBy: { date: "desc" },
    });

    if (!latest) {
      return NextResponse.json({ success: false, error: "No data available" }, { status: 404 });
    }

    const TOLA_TO_GRAM = 11.664;
    const goldGram = latest.fine_gold ? Math.round((latest.fine_gold / TOLA_TO_GRAM) * 10) / 10 : null;
    const silverGram = latest.silver ? Math.round((latest.silver / TOLA_TO_GRAM) * 10) / 10 : null;

    return NextResponse.json({
      success: true,
      data: {
        gold: {
          tola_24k: latest.fine_gold,
          tola_22k: latest.tejabi_gold,
          gram_24k: goldGram,
          currency: "NPR",
          unit_ne: "तोला",
          unit_en: "Tola",
        },
        silver: {
          tola: latest.silver,
          gram: silverGram,
          currency: "NPR",
          unit_ne: "तोला",
          unit_en: "Tola",
        },
        date: latest.date,
        source: latest.source,
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch prices" }, { status: 500 });
  }
}
