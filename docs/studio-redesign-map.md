# Studio mockup → existing application

Reference: https://wonderful-lombok-design-preview.brinyibis1024.chatgpt.site/ (authenticated owner-provided design preview, inspected 2026-10-28).

## Contract and exceptions

Implement the missing presentation/hierarchy only on `develop`. Keep the existing SvelteKit routes, Convex persistence/revision checks, Mapbox geocoding/directions/GPS validation, recorded bookings, idempotency, WhatsApp handoff, uploads, sanitization, language URLs, SEO and rental flag. No simulated prices, orders, testimonials, storage or map screenshot from the mockup enters the live application.

Owner clarifications take precedence over the mockup: the working calculator stays on the homepage at `#hitung-travel`; navigation is “Jasa Travel” in Indonesian; bare-chevron, swipe-capable image galleries remain; public AI/copyright notices remain removed. The owner confirmed original client photographs are not available yet and asked to retain the current imagery temporarily. Existing original logo files remain. Never overwrite custom CMS images or content.

## Complete screen mapping

| Mockup screen | Existing implementation | Presentation adaptation / preserved behavior |
| --- | --- | --- |
| Beranda lengkap | `/`, `/[lang]`, `src/routes/+page.svelte` | Photo-led hero, restrained benefits, clearer section rhythm, equal tour cards, original calculator, about and FAQ |
| Daftar paket wisata | `/[lang]/paket-wisata` | Same tour-card hierarchy as home; all published packages, existing locale/SEO data |
| Detail Lombok Selatan | `/[lang]/paket-wisata/lombok-selatan-budaya-sasak` | Shared gallery/summary, itinerary, inclusions and price tiers from CMS |
| Detail Gili Snorkeling | `/[lang]/paket-wisata/gili-snorkeling-escape` | Same template, original Gili content/price/unit and booking context |
| Detail Romantic Lombok | `/[lang]/paket-wisata/romantic-lombok-2h1m` | Same template, original multi-day itinerary and couple price unit |
| Kuta Mandalika | `/[lang]/destinasi/kuta-mandalika` | Balanced gallery and information; real CMS package relations |
| Tanjung Aan | `/[lang]/destinasi/tanjung-aan` | Shared destination template; original destination content |
| Tiga Gili | `/[lang]/destinasi/tiga-gili` | Shared destination template; original destination content |
| Sembalun | `/[lang]/destinasi/sembalun` | Shared template; preserve no-related-package state |
| Senggigi | `/[lang]/destinasi/senggigi` | Shared template; original destination content |
| Antar-jemput & kalkulator | Homepage `#hitung-travel`; existing `/[lang]/travel-lombok` compatibility route | Restyle original working component, not a separate primary menu destination; no mock distance/route calculation |
| Formulir pemesanan | `BookingDialog.svelte` on home/details | Adapt visual grouping within original accessible modal; preserve validation, POST, idempotency and WhatsApp flow |
| Admin Ringkasan | `/admin`, `active=overview` | Actual counts, recent requests and content shortcuts; no demo bookings/statistics |
| Admin Pemesanan | `/admin`, `active=bookings` | Original detail cards, route stops, CSV, reload, pagination, status and deletion confirmations |
| Kelola paket wisata | `/admin`, `active=packages`, list state | Dedicated thumbnail catalogue before editing; original package order and add/delete actions |
| Editor paket wisata | Same route, selected package editor state | Group original controls into information, pricing, itinerary/facilities, gallery, translations and advanced URL; read-only live preview; back to list |
| Kelola destinasi | `/admin`, `active=destinations`, list state | Thumbnail list, actual package-relation counts and edit action |
| Editor destinasi | Same route, selected destination editor state | Original description, manual relations, gallery and translations; read-only live preview |
| Tarif antar-jemput | `/admin`, `active=travel` | Original validated rate input and a clearly labelled derived example, not production pricing logic |
| Rental | `/admin`, `active=rentals` | Retain all vehicle fields/translations and public feature flag |
| Pertanyaan umum | `/admin`, `active=faqs` | Existing ordered accordion editors, add/delete, rich text and translations |
| Website & kontak | `/admin`, `active=settings` | Grouped contacts/social/theme/home/about forms; retain both themes and all upload controls |

Additional existing surfaces without a separate mockup: login, 404/error, SEO landing pages, sitemap/robots and API endpoints. Match visual tokens where relevant; preserve their existing contracts. No new public booking route or additional travel calculator is introduced.

## Responsive contract

Public: three tour columns on desktop, two on tablet, one on narrow phones; photos retain ratios, menus fit the viewport, gallery controls have 44px targets. Admin: desktop sidebar and sticky save bar, table/list catalogue, grouped editor with preview rail; tablet collapses sidebar and preview rail; phones use one content region, folded navigation, stacked fields and a compact sticky save control. Do not hide data to make a layout fit.

No new direction is drawn: this is a direct adaptation of an owner-selected mockup. Its quiet working borders, gentle panel radii and small contextual section labels are intentional reference-design exceptions to the generic page-skill defaults.
