/**
 * Nepali (Bikram Sambat) Date Conversion Library
 * Reference: BS 2000/01/01 = AD 1943/04/14
 * Standard lookup table used by the Nepal Government calendar
 */

// Days per month for each BS year [Baisakh ... Chaitra]
const BS_YEAR_DATA: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 31, 31, 32, 31, 31, 30, 30, 29, 29, 30, 31],
  2024: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2051: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2055: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2056: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2057: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2058: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2059: [30, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2060: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2061: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2062: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2063: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2064: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2065: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2066: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2067: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2068: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2069: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2070: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2071: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2072: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2073: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2074: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2075: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2076: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2088: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2091: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2092: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2093: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2094: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2095: [31, 31, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
};

const BS_START_YEAR = 2000;
// Reference: BS 2000/01/01 = AD 1943/04/13 (some implementations differ by 1 day; this is widely used)
const AD_REF = new Date(1943, 3, 14); // April 14, 1943

const BS_YEAR_AD_START_OVERRIDES: Record<number, Date> = {
  2083: new Date(2026, 3, 14),
  2084: new Date(2027, 3, 14),
};

export interface BSDate {
  year: number;
  month: number; // 1-based
  day: number;
  dayOfWeek: number; // 0=Sunday
}

function daysDiff(d1: Date, d2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / msPerDay);
}

/** Convert AD date → BS date */
export function adToBS(adDate: Date): BSDate {
  const overrideYears = Object.keys(BS_YEAR_AD_START_OVERRIDES)
    .map(Number)
    .sort((a, b) => a - b);

  for (const bsYear of overrideYears) {
    const start = BS_YEAR_AD_START_OVERRIDES[bsYear];
    const yearData = BS_YEAR_DATA[bsYear];
    const nextStart = BS_YEAR_AD_START_OVERRIDES[bsYear + 1] ?? (() => {
      const end = new Date(start);
      end.setDate(end.getDate() + yearData.reduce((sum, days) => sum + days, 0));
      return end;
    })();

    if (daysDiff(start, adDate) >= 0 && daysDiff(adDate, nextStart) > 0) {
      let remaining = daysDiff(start, adDate);
      for (let m = 0; m < 12; m++) {
        if (remaining < yearData[m]) {
          return {
            year: bsYear,
            month: m + 1,
            day: remaining + 1,
            dayOfWeek: adDate.getDay(),
          };
        }
        remaining -= yearData[m];
      }
    }
  }

  const totalDays = daysDiff(AD_REF, adDate);
  if (totalDays < 0) throw new Error("Date before BS 2000");

  let remaining = totalDays;
  let bsYear = BS_START_YEAR;
  let bsMonth = 1;
  let bsDay = 1;

  // Count through years
  while (true) {
    const yearData = BS_YEAR_DATA[bsYear];
    if (!yearData) break;
    const daysInYear = yearData.reduce((a, b) => a + b, 0);
    if (remaining < daysInYear) break;
    remaining -= daysInYear;
    bsYear++;
  }

  // Count through months
  const monthData = BS_YEAR_DATA[bsYear];
  if (monthData) {
    for (let m = 0; m < 12; m++) {
      if (remaining < monthData[m]) {
        bsMonth = m + 1;
        bsDay = remaining + 1;
        break;
      }
      remaining -= monthData[m];
    }
  }

  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    dayOfWeek: adDate.getDay(),
  };
}

/** Convert BS date → AD date */
export function bsToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  const overrideStart = BS_YEAR_AD_START_OVERRIDES[bsYear];
  if (overrideStart) {
    let totalDays = bsDay - 1;
    const yearData = BS_YEAR_DATA[bsYear];
    if (!yearData || bsMonth < 1 || bsMonth > 12 || bsDay < 1 || bsDay > yearData[bsMonth - 1]) {
      throw new Error("Invalid BS date");
    }
    for (let m = 0; m < bsMonth - 1; m++) {
      totalDays += yearData[m];
    }

    const result = new Date(overrideStart);
    result.setDate(result.getDate() + totalDays);
    return result;
  }

  let totalDays = 0;

  for (let y = BS_START_YEAR; y < bsYear; y++) {
    const yearData = BS_YEAR_DATA[y];
    if (!yearData) break;
    totalDays += yearData.reduce((a, b) => a + b, 0);
  }

  const yearData = BS_YEAR_DATA[bsYear];
  if (yearData) {
    for (let m = 0; m < bsMonth - 1; m++) {
      totalDays += yearData[m];
    }
    totalDays += bsDay - 1;
  }

  const result = new Date(AD_REF);
  result.setDate(result.getDate() + totalDays);
  return result;
}

/** Get the number of days in a BS month */
export function daysInBSMonth(year: number, month: number): number {
  return BS_YEAR_DATA[year]?.[month - 1] ?? 30;
}

/** Get the weekday (0=Sun) of the 1st day of a BS month */
export function firstDayOfBSMonth(year: number, month: number): number {
  const adDate = bsToAD(year, month, 1);
  return adDate.getDay();
}

/** Get today's BS date */
export function todayBS(): BSDate {
  return adToBS(new Date());
}

export const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];

export const BS_MONTHS_EN = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

export const DAYS_NE = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];
export const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL_NE = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];
export const DAYS_FULL_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliNums(n: number | string): string {
  return String(n).replace(/\d/g, (d) => nepaliDigits[parseInt(d)]);
}

/** Festivals list: { bsMonth, bsDay, ne, en, icon } where icon is a Lucide icon name */
export const BS_FESTIVALS = [
  { bsMonth: 1, bsDay: 1, ne: "नयाँ वर्ष", en: "Nepali New Year", icon: "PartyPopper" },
  { bsMonth: 1, bsDay: 1, ne: "विश्व स्वास्थ्य दिवस", en: "World Health Day", icon: "HeartPulse" },
  { bsMonth: 1, bsDay: 15, ne: "मेष संक्रान्ति", en: "Mesh Sankranti", icon: "Sun" },
  { bsMonth: 2, bsDay: 15, ne: "वृष संक्रान्ति", en: "Brish Sankranti", icon: "Sprout" },
  { bsMonth: 3, bsDay: 15, ne: "मिथुन संक्रान्ति", en: "Mithun Sankranti", icon: "Leaf" },
  { bsMonth: 4, bsDay: 15, ne: "कर्क संक्रान्ति", en: "Karkat Sankranti", icon: "Umbrella" },
  { bsMonth: 4, bsDay: 32, ne: "साउन संक्रान्ति", en: "Shrawan Sankranti", icon: "CloudRain" },
  { bsMonth: 5, bsDay: 29, ne: "तीज", en: "Teej", icon: "Music" },
  { bsMonth: 6, bsDay: 1, ne: "गाई जात्रा", en: "Gai Jatra", icon: "PawPrint" },
  { bsMonth: 6, bsDay: 15, ne: "इन्द्र जात्रा", en: "Indra Jatra", icon: "Drama" },
  { bsMonth: 7, bsDay: 1, ne: "विजया दशमी", en: "Vijaya Dashami", icon: "Sparkles" },
  { bsMonth: 7, bsDay: 15, ne: "कोजाग्रत पूर्णिमा", en: "Kojagrat Purnima", icon: "Moon" },
  { bsMonth: 7, bsDay: 18, ne: "दीपावली", en: "Tihar / Deepawali", icon: "Flame" },
  { bsMonth: 8, bsDay: 1, ne: "छठ पर्व", en: "Chhath Parwa", icon: "Sunrise" },
  { bsMonth: 9, bsDay: 1, ne: "पुष संक्रान्ति", en: "Poush Sankranti", icon: "Snowflake" },
  { bsMonth: 10, bsDay: 1, ne: "माघे संक्रान्ति", en: "Maghe Sankranti", icon: "Moon" },
  { bsMonth: 11, bsDay: 7, ne: "सरस्वती पूजा", en: "Saraswati Puja", icon: "BookOpen" },
  { bsMonth: 11, bsDay: 30, ne: "शिवरात्रि", en: "Shiva Ratri", icon: "Sparkles" },
  { bsMonth: 12, bsDay: 7, ne: "फागु पूर्णिमा / होली", en: "Holi", icon: "Palette" },
];

/** Format a BS date as string: e.g. "बैशाख ५, २०८१" */
export function formatBSDate(year: number, month: number, day: number, lang: "ne" | "en" = "ne"): string {
  if (lang === "ne") {
    return `${BS_MONTHS_NE[month - 1]} ${toNepaliNums(day)}, ${toNepaliNums(year)}`;
  }
  return `${BS_MONTHS_EN[month - 1]} ${day}, ${year}`;
}

/** Format AD date in locale string */
export function formatADDate(date: Date, lang: "ne" | "en" = "ne"): string {
  void lang;
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}
