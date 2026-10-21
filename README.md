<p align="center">
  <a href="https://wonderful-lombok-main.vercel.app">
    <img src="./static/wonderful-lombok-logo-new.png" alt="Wonderful Lombok" width="360">
  </a>
</p>

<h1 align="center">Wonderful Lombok</h1>

<p align="center">
  A multilingual website for private Lombok tours and point-to-point transfers, with an admin-managed catalog, WhatsApp booking, and route-based price estimates.
</p>

<p align="center">
  <a href="https://wonderful-lombok-main.vercel.app">Live showcase</a>
</p>

## About

Wonderful Lombok is a full-stack SvelteKit website for exploring tour packages and destinations, estimating transfer costs, and continuing a booking through WhatsApp. Its custom admin panel works as a lightweight content management system for translations, package details, prices, images, contact settings, and bookings.

This repository currently powers a showcase deployment. Production hosting and the final domain will be configured after client approval.

## Features

- Eight interface languages: Indonesian, English, Simplified Chinese, Traditional Chinese, Dutch, French, German, and Malay.
- Tour catalog with galleries, itineraries, inclusions, and group-based pricing.
- Lombok destination directory with image galleries and details.
- Transfer calculator with geolocation, road routing, maps, and distance-based estimates.
- Booking records stored in Convex before continuing through WhatsApp.
- Custom admin CMS for catalog content, translations, rich text, images, settings, and bookings, with revision checks that reject stale concurrent saves.
- SEO essentials including metadata, canonical URLs, `hreflang`, `robots.txt`, and a sitemap.
- Mobile-first responsive interface.
- Rental functionality retained behind a disabled feature flag until the service is available.

## Stack

- SvelteKit and Svelte 5
- Convex Database and File Storage
- Leaflet, OpenStreetMap, Nominatim, and OSRM
- Vercel

## Local development

Requirements: Node.js 22+ and a Convex account.

```bash
git clone https://github.com/Maoelan/wonderful-lombok.git
cd wonderful-lombok
npm ci
npx convex dev --once
npm run showcase:seed
npm run admin:create
npm run dev
```

Convex creates `.env.local` during setup. Use `.env.example` as the variable reference and replace every placeholder locally. Never commit real credentials or deployment secrets.

Open `http://127.0.0.1:5173` after the development server starts.

> [!WARNING]
> `npm run showcase:seed` replaces the catalog in the active Convex deployment with demo data from `src/lib/catalog.js`. Do not run it against data that must be preserved.

## Checks

```bash
npm test
npm run scan:secrets
npm run build
```

## Deployment

Deploy the Convex functions and schema before the SvelteKit application:

```bash
npx convex deploy
```

The catalog uses a revision-aware save. Deploying the app before Convex makes admin saves fail closed with `503` instead of overwriting data.

Configure the variables listed in `.env.example` through the hosting provider's protected environment settings, using production URLs and newly generated secrets. Then deploy the SvelteKit application to Vercel.

Set `PUBLIC_SITE_URL` to the final HTTPS domain before the public launch. Canonical URLs, language alternates, the sitemap, robots file, structured data, and production host redirects will then use that domain automatically. Add the optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` values after creating the client-owned webmaster accounts; no source-code change is required.

Follow [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) before and after each release. The post-deploy check is read-only:

```bash
SMOKE_BASE_URL=https://final-domain.example npm run smoke:prod
```

`smoke:prod` only sends GET requests. Do not run booking, upload, or catalog-mutation tests against production.

Do not commit admin credentials, environment files, deploy keys, customer records, database exports, or backups. Rotate a credential immediately if it is ever exposed.

## Security notes

- Administrative access is authenticated and server-side mutations require an active session.
- Session cookies use production-safe browser attributes and mutation requests are origin-checked.
- Uploaded files and editable catalog content are validated before storage.
- Security headers are applied by the application.
- Environment files, local Vercel metadata, private keys, dumps, and backups are excluded through `.gitignore`.
- The in-memory rate limiter is suitable for this showcase, not for a high-traffic multi-instance production deployment.

No public repository or application can be guaranteed vulnerability-free. Run the test suite, dependency audit, secret scan, and production build before each release.

## Photo credits

Demo imagery is sourced from Wikimedia Commons. Attribution and license details are available on the source pages for [Tanjung Aan](https://commons.wikimedia.org/wiki/Category:Tanjung_Aan_Beach), [Seger Beach](https://commons.wikimedia.org/wiki/File:PANTAI_SEGER.jpg), [Sade Village](https://commons.wikimedia.org/wiki/File:Traditional_Sasak_Village_Sade_houses.JPG), [the Gili Islands](https://commons.wikimedia.org/wiki/Category:Gili_Islands), [Senggigi](https://commons.wikimedia.org/wiki/Category:Senggigi), and [Rinjani and Sembalun](https://commons.wikimedia.org/wiki/Category:Rinjani-Lombok_UNESCO_Global_Geopark).

Replace all demo contact details, pricing, and content through the admin panel before using this project as an official business website.
