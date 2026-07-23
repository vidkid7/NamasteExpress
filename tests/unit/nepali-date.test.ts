import { describe, expect, it } from "vitest";
import { adToBS, bsToAD, formatADDate } from "@/lib/nepali-date";

function ymd(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

describe("Bikram Sambat conversion", () => {
  it("maps BS 2083 New Year to April 14, 2026", () => {
    expect(ymd(bsToAD(2083, 1, 1))).toBe("2026-04-14");
  });

  it("maps June 28, 2026 to BS 2083-03-14", () => {
    expect(adToBS(new Date(2026, 5, 28))).toMatchObject({
      year: 2083,
      month: 3,
      day: 14,
    });
  });

  it("maps April 14, 2027 to BS 2084 New Year", () => {
    expect(adToBS(new Date(2027, 3, 14))).toMatchObject({
      year: 2084,
      month: 1,
      day: 1,
    });
  });
});

describe("AD date formatting", () => {
  it("keeps Gregorian dates recognizable in Nepali UI", () => {
    expect(formatADDate(new Date(2026, 5, 28), "ne")).toBe("June 28, 2026");
  });
});
