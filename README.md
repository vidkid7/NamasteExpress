# NamasteExpress (नमस्ते एक्सप्रेस)

A full-featured Nepali news portal built with Next.js 16, Prisma, and PostgreSQL.

## Features
- 🌐 Bilingual (Nepali + English)
- 📰 Full news portal with categories, articles, video, photo gallery
- 📅 Nepali calendar (Patro) with holidays, rashifal, gold/silver, forex, date converter
- 🔐 Admin panel with role-based access (Admin / Editor / Author)
- 🎨 Glassmorphic liquid design system
- ⚡ Next.js 16 with Turbopack

## Deploy on cPanel Node.js Hosting

Use Node.js 20.19.4 or newer. Configure the application in production mode and keep all secrets in cPanel's environment-variable settings.

Recommended deployment commands:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Copy the keys from `.env.example` into cPanel and supply production values. Never upload or commit `.env`.

Required settings include:
```
DATABASE_URL         # cPanel PostgreSQL connection string
NEXTAUTH_URL         # canonical HTTPS application URL
NEXTAUTH_SECRET      # run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET          # same command, different value
NEXT_PUBLIC_SITE_URL # canonical HTTPS application URL
```

Seed only when intentionally creating initial data. Production seed passwords must be supplied through environment variables:
```bash
npx prisma db seed
```

## Local Development

```bash
cp .env.example .env
# Fill in .env values

npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Development seed accounts use the `@namastexpress.com` domain. Production seeding requires `SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD`, and `SEED_AUTHOR_PASSWORD`; development fallback passwords are rejected for privileged production login.

## Admin Panel

Visit `/admin` — requires ADMIN or EDITOR role.


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
