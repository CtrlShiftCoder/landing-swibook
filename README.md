# Swibook Landing

Marketing landing for **Swibook**, animated with GSAP. Spanish (neutral LATAM) + English i18n, SEO meta, and responsive layout.

## Dev

```bash
npm install
npm run dev
```

- Spanish (default): http://localhost:5173/
- English: http://localhost:5173/en

## Env

Copy `.env.example` to `.env` and set:

```
VITE_SITE_URL=https://swibook.sibylab.com
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=contacto@sibylab.com
CONTACT_FROM_EMAIL="Swibook <contacto@sibylab.com>"
```

- `VITE_*` → client (canonical / OG).
- `RESEND_*` / `CONTACT_*` → **server only** (`api/waitlist.ts` on Vercel). Same Resend account as landing Sibylab. Emails go to `contacto@sibylab.com` with subject `[Swibook]…` and Resend tags `product=swibook`.

For local waitlist sends: `npx vercel dev` (plain `vite` has no `/api`). On Vercel, set the same env vars in Project → Settings → Environment Variables.

## Build

```bash
npm run build
npm run preview
```

Static SEO files are copied from `public/`: `robots.txt`, `sitemap.xml`. SPA rewrites: `public/_redirects` (Netlify) and `vercel.json`.
