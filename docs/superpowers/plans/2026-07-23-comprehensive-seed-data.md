# Comprehensive Seed Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale partial seed with a deterministic, idempotent seed that fills every user-facing NamasteXpress model and records provenance for verified Nepal data.

**Architecture:** Keep date logic, verified snapshots, editorial fixtures, database mutation, and verification in separate modules. `prisma/seed.ts` becomes a thin entrypoint; `seed-runner.ts` performs ordered transactions and returns model counts for verification.

**Tech Stack:** TypeScript, Prisma 6.19, PostgreSQL 16, Vitest 4, bcryptjs

## Global Constraints

- Default seed timezone is `Asia/Kathmandu`.
- `SEED_DATE` accepts only `YYYY-MM-DD`.
- Seed execution performs no network requests.
- Verified snapshots carry source URL and as-of date.
- Editorial content is explicitly marked as demonstration content.
- No active sessions, OAuth accounts, reset tokens, or verification tokens are seeded.
- Seed-owned records use stable IDs, slugs, emails, or composite keys.
- Rerunning the seed must not change seed-owned record counts.

---

### Task 1: Nepal Seed-Date Contract

**Files:**
- Create: `prisma/seed-data/seed-date.ts`
- Create: `tests/unit/seed-date.test.ts`

**Interfaces:**
- Produces: `createSeedClock(value?: string, now?: Date): SeedClock`
- Produces: `SeedClock` with `isoDate`, `day`, `hoursAgo()`, `daysAgo()`, and `daysFromNow()`

- [ ] **Step 1: Write the failing unit test**

```ts
import { describe, expect, it } from "vitest";
import { createSeedClock } from "../../prisma/seed-data/seed-date";

describe("createSeedClock", () => {
  it("normalizes an explicit Nepal date to a stable UTC day", () => {
    const clock = createSeedClock("2026-07-23");
    expect(clock.isoDate).toBe("2026-07-23");
    expect(clock.day.toISOString()).toBe("2026-07-23T00:00:00.000Z");
    expect(clock.hoursAgo(2).toISOString()).toBe("2026-07-22T22:00:00.000Z");
  });

  it("rejects invalid overrides before seeding", () => {
    expect(() => createSeedClock("23-07-2026")).toThrow(
      "SEED_DATE must use YYYY-MM-DD"
    );
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/unit/seed-date.test.ts`

Expected: FAIL because `prisma/seed-data/seed-date.ts` does not exist.

- [ ] **Step 3: Implement the clock**

```ts
export type SeedClock = {
  isoDate: string;
  day: Date;
  hoursAgo: (hours: number) => Date;
  daysAgo: (days: number) => Date;
  daysFromNow: (days: number) => Date;
};

export function createSeedClock(value?: string, now = new Date()): SeedClock {
  const isoDate =
    value ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
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
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/unit/seed-date.test.ts`

Expected: 2 tests pass.

### Task 2: Verified Snapshots and Fixture Validation

**Files:**
- Create: `prisma/seed-data/verified-snapshots.ts`
- Create: `prisma/seed-data/editorial-fixtures.ts`
- Create: `prisma/seed-data/validate-fixtures.ts`
- Create: `tests/unit/seed-fixtures.test.ts`

**Interfaces:**
- Produces: `verifiedSnapshots` with `forex`, `goldSilver`, `holidays`, and source metadata
- Produces: deterministic exported fixture arrays for taxonomy, identity, editorial, engagement, media, sports, ads, settings, and daily content
- Produces: `validateSeedFixtures(): void`

- [ ] **Step 1: Write fixture-contract tests**

```ts
import { describe, expect, it } from "vitest";
import { editorialFixtures } from "../../prisma/seed-data/editorial-fixtures";
import { verifiedSnapshots } from "../../prisma/seed-data/verified-snapshots";
import { validateSeedFixtures } from "../../prisma/seed-data/validate-fixtures";

describe("seed fixtures", () => {
  it("covers every homepage category with unique article slugs", () => {
    validateSeedFixtures();
    const slugs = editorialFixtures.articles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(editorialFixtures.articles.map((article) => article.category))).toEqual(
      expect.objectContaining({ size: expect.any(Number) })
    );
    expect(slugs.length).toBeGreaterThanOrEqual(36);
  });

  it("contains attributed factual snapshots", () => {
    expect(verifiedSnapshots.forex.sourceUrl).toBe(
      "https://www.nrb.org.np/forex/"
    );
    expect(verifiedSnapshots.forex.rates).toHaveLength(21);
    expect(verifiedSnapshots.goldSilver.sourceUrl).toContain("fenegosida.org");
    expect(verifiedSnapshots.holidays.sourceUrl).toContain("moha.gov.np");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/unit/seed-fixtures.test.ts`

Expected: FAIL because the fixture modules do not exist.

- [ ] **Step 3: Add checked-in verified snapshots**

Use the latest verified material available on 2026-07-23:

- Nepal Rastra Bank daily rates dated 2026-07-21 from `https://www.nrb.org.np/forex/`
- NRB API contract from `https://www.nrb.org.np/api-docs-v1/`
- Ministry of Home Affairs 2083 holiday notice from `https://moha.gov.np/en/page/government-and-public-holidays-in-2083`
- FENEGOSIDA weekly report index from `https://www.fenegosida.org/download-reports.php`

Export typed arrays. Forex rows must include all 21 NRB currencies and exact unit, buy, and sell values. Gold rows must preserve the official report date and prices rather than extrapolating to the seed date.

- [ ] **Step 4: Add deterministic editorial fixtures**

Export stable fixtures with:

- 10 users across all four roles
- 17 categories and at least 15 tags
- At least 36 articles, with at least two articles per primary homepage category
- 4 media files, 3 reels, 2 galleries with 8 images, and 3 web stories
- 6 comments, 2 replies, 6 votes, 4 bookmarks
- 3 tournaments, 8 teams, and 7 matches covering completed/live/upcoming states
- 5 advertisement positions and 5 active advertisements
- 20 newsletter subscriptions, 3 audit records, and 40 deterministic page views
- 12 rashifal records and one panchang record for the seed anchor

Every editorial title or description must contain either `डेमो` or `Demo` in its metadata/copy, and images must use stable `/seed/...` or `https://picsum.photos/seed/...` URLs.

- [ ] **Step 5: Implement fixture validation**

`validateSeedFixtures()` must throw for duplicate email, slug, stable ID, unsupported category reference, missing source URL, non-positive currency unit, or any rashifal sign set other than the exact 12 supported signs.

- [ ] **Step 6: Run fixture tests and verify GREEN**

Run: `npm test -- tests/unit/seed-fixtures.test.ts`

Expected: all fixture-contract tests pass.

### Task 3: Transactional Seed Runner and Complete Model Coverage

**Files:**
- Create: `prisma/seed-data/seed-runner.ts`
- Replace: `prisma/seed.ts`
- Create: `tests/integration/seed-runner.test.ts`

**Interfaces:**
- Consumes: `PrismaClient`, `SeedClock`, verified snapshots, editorial fixtures
- Produces: `runSeed(prisma, clock, passwords): Promise<SeedSummary>`
- Produces: `verifySeed(prisma, clock): Promise<SeedSummary>`

- [ ] **Step 1: Write the integration test**

```ts
import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { createSeedClock } from "../../prisma/seed-data/seed-date";
import { runSeed, verifySeed } from "../../prisma/seed-data/seed-runner";

const prisma = new PrismaClient();
const clock = createSeedClock("2026-07-23");
const passwords = {
  admin: "Admin@12345",
  editor: "Editor@12345",
  author: "Author@12345",
};

describe("runSeed", () => {
  afterAll(() => prisma.$disconnect());

  it("populates every public model and remains idempotent", async () => {
    const first = await runSeed(prisma, clock, passwords);
    const second = await runSeed(prisma, clock, passwords);
    expect(second).toEqual(first);
    await expect(verifySeed(prisma, clock)).resolves.toEqual(first);
    expect(first.article).toBeGreaterThanOrEqual(36);
    expect(first.rashifal).toBe(12);
    expect(await prisma.session.count()).toBe(0);
    expect(await prisma.passwordResetToken.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run the integration test and verify RED**

Run: `$env:SEED_DATE='2026-07-23'; npm test -- tests/integration/seed-runner.test.ts`

Expected: FAIL because `runSeed` and `verifySeed` do not exist.

- [ ] **Step 3: Implement ordered stage transactions**

Implement five `$transaction` stages matching the design:

1. Users, categories, tags
2. Media, articles, article tags, breaking news, reels, galleries, web stories
3. Comments, votes, bookmarks, newsletters, page views, audit logs
4. Tournaments, teams, matches, ad positions, advertisements
5. Settings, holidays, panchang, gold/silver, forex, rashifal

Use `upsert` with nonempty `update` objects for all seed-owned records. Delete and recreate only seed-owned join/engagement rows identified by stable `seed-` IDs.

- [ ] **Step 4: Implement the thin entrypoint**

`prisma/seed.ts` must:

```ts
const clock = createSeedClock(process.env.SEED_DATE);
validateSeedFixtures();
const summary = await runSeed(prisma, clock, {
  admin: seedPassword("SEED_ADMIN_PASSWORD", "Admin@12345"),
  editor: seedPassword("SEED_EDITOR_PASSWORD", "Editor@12345"),
  author: seedPassword("SEED_AUTHOR_PASSWORD", "Author@12345"),
});
await verifySeed(prisma, clock);
console.log(JSON.stringify({ seedDate: clock.isoDate, summary }, null, 2));
```

It must retain the production password guard and never print a password.

- [ ] **Step 5: Run the integration test and verify GREEN**

Run: `$env:SEED_DATE='2026-07-23'; npm test -- tests/integration/seed-runner.test.ts`

Expected: one integration test passes after two complete seed runs.

### Task 4: Seed, Route Verification, and Documentation

**Files:**
- Modify: `package.json`
- Create: `scripts/verify-seed.ts`
- Modify: `.env.example`
- Create: `docs/seed-data.md`

**Interfaces:**
- Produces: `npm run db:seed:verify`

- [ ] **Step 1: Add the verification command**

Add:

```json
"db:seed:verify": "tsx scripts/verify-seed.ts"
```

The script creates a Prisma client, calls `verifySeed(createSeedClock(process.env.SEED_DATE))`, prints JSON counts, and exits nonzero on invariant failure.

- [ ] **Step 2: Document operation and provenance**

Document:

- Dedicated container: `namastexpress-postgres`
- Configure the local PostgreSQL connection through `DATABASE_URL`; do not commit credentials.
- `npm run db:push`
- `npm run db:seed`
- `npm run db:seed:verify`
- Optional `SEED_DATE=YYYY-MM-DD`
- Verified source URLs and their as-of dates
- Demo-data labeling and security-token exclusions

- [ ] **Step 3: Run all verification**

Run:

```powershell
$env:SEED_DATE='2026-07-23'
npm run db:seed
npm run db:seed
npm run db:seed:verify
npm test -- tests/unit/seed-date.test.ts tests/unit/seed-fixtures.test.ts tests/integration/seed-runner.test.ts
npm run lint
```

Expected:

- Both seed runs succeed with identical counts.
- Verification reports at least 36 articles and exactly 12 current rashifal entries.
- Focused tests pass.
- Lint introduces no new seed-related errors.

- [ ] **Step 4: Verify application routes**

With the development server running, request:

- `/`
- `/sports`
- `/finance`
- `/patro`
- `/patro/forex`
- `/patro/gold-silver`
- `/rashifal`
- `/reels`
- `/galleries`
- `/api/v1/articles?pageSize=8`
- `/api/v1/finance/exchange-rates`
- `/api/v1/finance/gold-silver`
- `/api/v1/calendar/holidays`
- `/api/v1/calendar/panchang`

Expected: public pages return 200; data APIs return 200 with nonempty payloads and no Prisma errors.
