export type SeedClock = {
  isoDate: string;
  day: Date;
  hoursAgo: (hours: number) => Date;
  daysAgo: (days: number) => Date;
  daysFromNow: (days: number) => Date;
};

function kathmanduDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function createSeedClock(value?: string, now = new Date()): SeedClock {
  const isoDate = value ?? kathmanduDate(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error("SEED_DATE must use YYYY-MM-DD");
  }
  const day = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== isoDate) {
    throw new Error("SEED_DATE must be a valid calendar date");
  }
  return {
    isoDate,
    day,
    hoursAgo: (hours) => new Date(day.getTime() - hours * 3_600_000),
    daysAgo: (days) => new Date(day.getTime() - days * 86_400_000),
    daysFromNow: (days) => new Date(day.getTime() + days * 86_400_000),
  };
}
