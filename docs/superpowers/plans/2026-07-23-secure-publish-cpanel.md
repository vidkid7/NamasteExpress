# NamasteExpress Secure Publish and cPanel Deployment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Audit and harden NamasteExpress, publish only safe project files to `vidkid7/NamasteExpress`, and deploy a fresh cPanel Node.js application with GitHub-triggered updates.

**Architecture:** Keep secrets and generated/runtime files out of Git, enforce validation and bounded uploads at server boundaries, and deploy Next.js through cPanel's Node.js application manager using Node 20.19.4 or newer. GitHub remains the source of truth; cPanel receives the selected branch through its supported deployment mechanism.

**Tech Stack:** Next.js 16, TypeScript, Prisma/PostgreSQL, npm, cPanel Node.js/Passenger, GitHub.

## Global Constraints

- Never commit `.env`, credentials, private keys, database dumps, runtime logs, or generated build/cache directories.
- Use Node.js `20.19.4` or newer for this project.
- Delete existing cPanel Node applications only after action-time confirmation; the user has now confirmed deletion.
- Do not expose passwords, tokens, or database connection strings in reports or commits.
- Verify security audit, tests, lint, build, Git status, GitHub branch, and cPanel application state before claiming completion.

### Task 1: Security and dependency audit

**Files:** Read-only audit of `src`, `prisma`, `scripts`, `package.json`, `package-lock.json`, and configuration files; create `docs/security-audit.md` only after findings are verified.

- [ ] Map rate limiting, authentication/authorization, input validation, error responses, secret access, and upload handlers.
- [ ] Run `npm audit --omit=dev` and record exact advisories and fix versions.
- [ ] Inspect all tracked/untracked files for secrets and generated artifacts.
- [ ] Fix confirmed P0/P1 findings and add focused regression tests.

### Task 2: Repository cleanup and Git hygiene

**Files:** `.gitignore`, `README.md`, generated/log/cache paths, and only explicitly confirmed obsolete files.

- [ ] Create a comprehensive Next.js/Prisma/cPanel `.gitignore`.
- [ ] Preserve source, Prisma schema/migrations/seed, tests, deployment docs, and required static assets.
- [ ] Remove only disposable generated/runtime artifacts after validating their paths.
- [ ] Confirm no secret-like values or old branding remain in the publish set.

### Task 3: Verification and local repository setup

**Files:** no source changes unless Task 1 requires them.

- [ ] Run focused tests, full tests, lint, build, and a local HTTP smoke check.
- [ ] Initialize local Git if needed, add `https://github.com/vidkid7/NamasteExpress.git`, create `agent/secure-namastexpress-deploy`, and inspect the exact staged file list.

### Task 4: Publish to GitHub

**Files:** only the reviewed publish set.

- [ ] Commit with a concise message describing security hardening and deployment preparation.
- [ ] Push the branch to GitHub and verify the remote branch contents.
- [ ] Open a draft PR only if it is useful and does not replace the requested direct deployment.

### Task 5: Fresh cPanel deployment

**Files:** cPanel application registration and deployment configuration only.

- [ ] Delete the two confirmed existing Node applications.
- [ ] Create a new Node application with Node 20.19.4+, production mode, and the correct application root/startup configuration.
- [ ] Connect the GitHub repository/branch using the cPanel-supported deployment hook or Git Version Control flow.
- [ ] Configure environment variables through cPanel secrets/environment settings, never through Git.
- [ ] Verify application status, domain routing, database connectivity, and a health route.

## Acceptance Checks

- `npm audit --omit=dev` has no unresolved high/critical issue, or each exception is documented with mitigation.
- No secrets or disposable artifacts are staged.
- Tests, lint, and build exit successfully.
- GitHub contains the intended branch and files only.
- cPanel shows exactly one fresh NamasteExpress Node application on Node 20.19.4+ and the deployment path is documented.
