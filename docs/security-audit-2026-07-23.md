# NamasteExpress Security Audit

**Date:** 2026-07-23
**Scope:** Rate limiting, input validation, secrets, dependencies, error handling, information leakage, and file-upload safety.

## Result

No critical or high-severity production dependency advisory remains. `npm audit` reports zero vulnerabilities after upgrading Next.js, Sharp, Vite, TSX, and affected transitive packages.

## Controls reviewed

| Area | Result | Evidence and remaining constraints |
|---|---|---|
| Rate limiting | Implemented | Proxy-level limits cover API reads, writes, authentication, and credential login. Authentication also uses IP/email limiting and account lockout. The in-memory limiter is appropriate for the current single cPanel process but must move to Redis before horizontal scaling. |
| Input validation | Implemented | Zod validates authentication and primary content workflows; Prisma parameterizes database queries. Unsafe API methods enforce same-origin requests. Forwarded-host input is no longer accepted as an origin allowlist entry. |
| Secrets | Protected from Git | `.env`, keys, certificates, dumps, logs, and runtime files are ignored. `.env.example` contains placeholders only. Production secrets must be generated and stored in cPanel environment variables. |
| Dependencies | Clean | `npm audit` reports 0 vulnerabilities. Next.js is 16.2.11 and Sharp is forced to 0.35.3 throughout the dependency tree. |
| Error handling | Safe responses | API responses use generic client-facing errors and do not return stack traces or database details. Detailed errors remain server-side in logs. |
| Information leakage | No direct leak found | Authentication responses do not return password hashes or tokens. Admin path obfuscation is supplemental; authorization remains session and role based. Debug mode is development-only. |
| File uploads | Hardened | Uploads require an authorized role, supported MIME type, bounded size, verified file signature, generated server filename, sanitized original basename, and bounded alt text. Local paths reject traversal. Cloudinary is recommended for production persistence. |

## Deployment requirements

- Use Node.js 20.19.4 or newer.
- Set `NODE_ENV=production`.
- Generate new `AUTH_SECRET` and `NEXTAUTH_SECRET`; do not reuse development values.
- Set the canonical HTTPS URL in `NEXTAUTH_URL`, `AUTH_URL`, and `NEXT_PUBLIC_SITE_URL`.
- Configure Cloudinary or another persistent upload provider; cPanel application files are not a durable media store for automated deployments.
- Do not run the development seed defaults in production. Supply all `SEED_*_PASSWORD` values when production seeding is intentionally required.

## Follow-up hardening

- Replace the in-memory rate limiter with Redis if the application is scaled beyond one Node process.
- Move the production CSP from inline allowances toward nonce- or hash-based scripts when the Next.js integration is ready.
- Add automated `npm audit --omit=dev` and build checks to the GitHub deployment workflow.
