# Comprehensive Seed Data Design

## Purpose

Build a deterministic, idempotent development seed for NamasteXpress that makes every public-facing section useful immediately after setting up the dedicated local PostgreSQL database.

The seed must distinguish verified public facts from editorial demonstration content. It must never present invented news or sports events as verified current reporting.

## Data Policy

### Verified snapshots

Time-sensitive public datasets are stored as checked-in snapshots with an `asOf` date and source metadata:

- Nepal Rastra Bank foreign-exchange rates
- Federation of Nepal Gold and Silver Dealers' Association prices
- Nepal public holidays and calendar mappings
- Panchang values when an authoritative structured source is available

The seed does not depend on network access. Snapshot collection and seed execution are separate operations so a source outage cannot leave a partially seeded database.

### Demonstration content

Articles, breaking-news banners, reels, galleries, web stories, comments, and sports fixtures are deterministic demonstration records. Their timestamps are calculated from the seed anchor date, and their copy avoids claiming that fabricated events are real breaking news.

Site settings record that the local database contains demonstration editorial content.

## Seed Anchor

The seed uses the current date in `Asia/Kathmandu` by default. A valid ISO date supplied through `SEED_DATE` overrides the current date for reproducible tests.

All daily records are normalized to a stable UTC instant representing the Nepal calendar day. Relative publication and match timestamps are derived from this anchor.

An invalid `SEED_DATE` fails before database mutations begin.

## Architecture

The seed is split into focused modules:

- `prisma/seed-data/verified-snapshots.ts`: checked-in factual datasets and source metadata
- `prisma/seed-data/editorial-fixtures.ts`: deterministic editorial and engagement fixtures
- `prisma/seed-data/seed-date.ts`: Nepal-time anchor parsing and date helpers
- `prisma/seed-data/seed-runner.ts`: ordered, transactional upserts and relationship wiring
- `prisma/seed.ts`: environment validation, Prisma lifecycle, summary output, and failure handling

Small fixture modules keep factual snapshots separate from demonstration copy and make each dataset independently testable.

## Coverage

The seed populates:

- Users for `ADMIN`, `EDITOR`, `AUTHOR`, and `READER`
- Categories, tags, articles, article-tag relationships, and authorship
- Comments, nested replies, comment votes, and article comment counts
- Reader bookmarks
- Media records used by articles, galleries, reels, and stories
- Breaking news, reels, galleries, gallery images, and web stories
- Tournaments, teams, completed/live/upcoming matches
- Advertisement positions and active advertisements
- Page-view analytics with article and anonymous traffic
- Site settings, including seed provenance
- Newsletter subscriptions
- Audit-log examples tied to the seeded administrator
- Holidays, panchang, gold/silver prices, foreign-exchange rates, and daily rashifal

Authentication accounts, active sessions, email-verification tokens, and password-reset tokens remain empty because manufacturing active credentials or security tokens is unsafe and provides no public-site value.

## Idempotency and Ownership

Every fixture has a stable natural key or stable seed ID. Rerunning the seed updates seed-owned fields and relationships instead of creating duplicates.

The seed does not delete arbitrary user-created records. It only replaces or updates records identified by reserved seed keys, IDs, slugs, or email domains.

Random values are prohibited. Engagement counts, dates, ratings, and scores are deterministic so tests and screenshots remain reproducible.

## Transaction and Failure Behavior

Environment validation and fixture validation run before writes. Seed stages run in dependency order:

1. Identity and taxonomy
2. Media and editorial content
3. Engagement and analytics
4. Sports and advertisements
5. Settings and factual daily datasets

Each logical stage uses a database transaction. A failed stage rolls back its own writes and stops later stages. The command exits nonzero and reports the failed stage without printing passwords or connection strings.

## Verification

Automated tests cover:

- Nepal seed-date normalization and `SEED_DATE` validation
- Stable fixture identifiers and unique slugs/emails
- Complete category coverage for homepage sections
- Referential integrity between articles, tags, users, media, comments, and bookmarks
- Exactly 12 rashifal entries for the anchor date
- Required currencies and source metadata
- Idempotency after two consecutive seed runs
- No fabricated auth sessions or security tokens

After seeding, an integration verifier checks minimum record counts, orphaned relations, current daily records, and required settings. The public homepage and principal API routes must return successful responses against the seeded database.

## Success Criteria

- A fresh NamasteXpress database becomes visually populated after one `npm run db:seed`.
- Running the command twice produces the same seed-owned record counts.
- All user-facing Prisma models contain coherent data.
- Verified snapshots include visible source and as-of metadata.
- Demo editorial content is distinguishable from verified facts.
- Homepage, category, finance, calendar, sports, reels, gallery, and admin summary routes load without Prisma errors.
