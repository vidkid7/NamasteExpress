import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const NAME_NE: Record<string, string> = {
  USD: "अमेरिकी डलर", EUR: "युरो", GBP: "बेलायती पाउण्ड",
  INR: "भारतीय रुपैयाँ", CNY: "चिनियाँ युआन", AUD: "अष्ट्रेलियाली डलर",
  SGD: "सिङ्गापुर डलर", CAD: "क्यानाडाली डलर", JPY: "जापानी येन",
  CHF: "स्विस फ्र्यांक", SAR: "साउदी रियाल", QAR: "कतारी रियाल",
  THB: "थाई बाट", AED: "यूएई दिर्हाम", MYR: "मलेसियाली रिंगिट",
  KRW: "दक्षिण कोरियाली वन",
};

export async function GET() {
  try {
    const latestDate = await prisma.forexRate.findFirst({
      orderBy: { date: "desc" },
      select: { date: true },
    });

    if (!latestDate) {
      return NextResponse.json({ success: false, error: "No forex data" }, { status: 404 });
    }

    const rates = await prisma.forexRate.findMany({
      where: { date: latestDate.date },
      orderBy: { currency: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: rates.map((r) => ({
        code: r.currency,
        name: r.currency_name ?? r.currency,
        name_ne: NAME_NE[r.currency] ?? r.currency_name ?? r.currency,
        buy: r.buy,
        sell: r.sell,
        unit: r.unit,
      })),
      date: latestDate.date,
      timestamp: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch exchange rates" }, { status: 500 });
  }
}
