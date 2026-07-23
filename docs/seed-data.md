# NamasteXpress seed data

The local development database is the dedicated `namastexpress-postgres` container:

```text
Set `DATABASE_URL` in the local `.env` file with your own PostgreSQL credentials.
```

Initialize and populate it with:

```powershell
npm run db:push
$env:SEED_DATE='2026-07-23' # optional; defaults to the current Kathmandu date
npm run db:seed
npm run db:seed:verify
```

The seed is idempotent. Running it again updates seed-owned records without multiplying articles, comments, analytics, or relationships.

The seed contains demonstration editorial content so the local site is populated without presenting invented events as live reporting. It also includes verified factual snapshots:

- Nepal Rastra Bank foreign-exchange rates, as of 2026-07-21: <https://www.nrb.org.np/forex/>
- Nepal Rastra Bank API reference: <https://www.nrb.org.np/api-docs-v1/>
- FENEGOSIDA gold/silver report snapshot: <https://www.fenegosida.org/uploads/weekly/26061907242936a276.pdf>
- Ministry of Home Affairs 2083 public-holiday notice: <https://moha.gov.np/en/page/government-and-public-holidays-in-2083>

Security-sensitive sessions, OAuth accounts, email-verification tokens, and password-reset tokens are intentionally not seeded.
