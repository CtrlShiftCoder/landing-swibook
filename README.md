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
# VITE_APP_URL=https://swibook.app
```

- `VITE_SITE_URL` → canonical / OG.
- `VITE_APP_URL` → product app origin for login CTAs (default `https://swibook.app`).

## Build

```bash
npm run build
npm run preview
```

Static SEO files are copied from `public/`: `robots.txt`, `sitemap.xml`. SPA rewrites: `public/_redirects` (Netlify) and `vercel.json`.
