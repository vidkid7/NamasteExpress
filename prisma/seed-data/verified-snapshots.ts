export type VerifiedForexRate = {
  currency: string;
  currency_name: string;
  buy: number;
  sell: number;
  unit: number;
};

export const verifiedSnapshots = {
  forex: {
    asOf: "2026-07-21",
    sourceUrl: "https://www.nrb.org.np/forex/",
    rates: [
      ["USD", "US Dollar", 154.02, 154.62, 1],
      ["EUR", "European Euro", 176.03, 176.72, 1],
      ["GBP", "UK Pound Sterling", 207.32, 208.13, 1],
      ["CHF", "Swiss Franc", 190.58, 191.33, 1],
      ["AUD", "Australian Dollar", 107.78, 108.20, 1],
      ["CAD", "Canadian Dollar", 109.77, 110.20, 1],
      ["SGD", "Singapore Dollar", 119.30, 119.76, 1],
      ["JPY", "Japanese Yen", 9.48, 9.52, 10],
      ["CNY", "Chinese Yuan", 22.76, 22.85, 1],
      ["SAR", "Saudi Arabian Riyal", 41.01, 41.17, 1],
      ["QAR", "Qatari Riyal", 42.25, 42.42, 1],
      ["THB", "Thai Baht", 4.58, 4.60, 1],
      ["AED", "UAE Dirham", 41.93, 42.10, 1],
      ["MYR", "Malaysian Ringgit", 37.63, 37.78, 1],
      ["KRW", "South Korean Won", 10.39, 10.43, 100],
      ["INR", "Indian Rupee", 160.00, 160.15, 100],
      ["SEK", "Swedish Kroner", 15.94, 16.00, 1],
      ["DKK", "Danish Kroner", 23.55, 23.64, 1],
      ["HKD", "Hong Kong Dollar", 19.64, 19.72, 1],
      ["KWD", "Kuwaiti Dinar", 500.72, 502.67, 1],
      ["BHD", "Bahraini Dinar", 408.38, 409.97, 1],
    ].map(([currency, currency_name, buy, sell, unit]) => ({
      currency: currency as string,
      currency_name: currency_name as string,
      buy: buy as number,
      sell: sell as number,
      unit: unit as number,
    })) satisfies VerifiedForexRate[],
  },
  goldSilver: {
    asOf: "2026-06-19",
    sourceUrl: "https://www.fenegosida.org/uploads/weekly/26061907242936a276.pdf",
    fineGoldPerTola: 286700,
    fineGoldPerTenGram: 245800,
    silverPerTola: 4640,
    silverPerTenGram: 3978,
  },
  holidays: {
    asOf: "2083-04-05",
    sourceUrl: "https://moha.gov.np/en/page/government-and-public-holidays-in-2083",
  },
} as const;
