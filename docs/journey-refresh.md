# Lombok journey refresh — develop only

The owner's supplied desktop/mobile mockup and brainstorm are the design contract, not a new randomly chosen direction. This is a presentation refresh, not an admin or backend rewrite.

## Page argument

- Explore Lombok without arranging every transfer yourself → a south-Lombok-inspired coastal hero, tour and transfer actions.
- Compare the actual published tours → equal 4:3 photo cards with duration, category, route, price and unit; full itinerary stays on the detail page.
- Browse places individually → five distinct destination covers; keep destination dropdowns on detail pages.
- Check a transfer before booking → one homepage calculator introduction, location inputs first, map and estimated fare, then a clearly labelled customer-details group.
- Confirm the trip with a person → existing recorded booking flow and WhatsApp handoff, unchanged.

## Inventory and boundaries

Lombok-specific material: Sasak lumbung granaries, south-coast rounded headlands, Kuta Mandalika bay, Tanjung Aan sand, flat palm-covered Gili islands, snorkeling boat, Sembalun farmland and Rinjani slopes, Senggigi coast, Lombok countryside transfers, three existing package units, and the operator's existing CMS catalogue. No new testimonials, ratings, certifications, prices, transport features or booking states are invented.

The supplied mockup intentionally calls for equal product cards, an outlined secondary hero action, a restrained sand-toned section and a longer invitation headline. These owner requirements take precedence over generic design-skill preferences. Logo, font, two CMS theme choices, locale URLs, admin editors, accessibility labels, all published packages and data contracts are preserved.

## Generated imagery

Ten standalone photographic assets were generated with the built-in image-generation tool. Exact scene prompts and the complete mandatory negative prompt are in `static/images/lombok-ai/manifest.json`. These are Lombok-inspired mockup images, not verified documentary photographs. Visible localized disclosure appears on public pages using the demo imagery. Replace them with operator-approved actual photographs before a real commercial launch.

Responsive WebP variants (480/720/960/1280/1600 px) are committed under `static/images/lombok-ai/`. Original generated PNGs remain outside the repository. `scripts/build-demo-images.py` reproduces delivery variants from a private local key-to-source-path map. These static assets bypass the dynamic Vercel image service; CMS uploads retain their existing behavior.

Only exact bundled legacy seed image URLs and unchanged legacy hero copy are refreshed on read. Custom CMS uploads, custom gallery mixtures, intentional empty galleries and edited copy are not overwritten. The server accepts only the ten named local assets and their five delivery sizes, not arbitrary local image paths.

## Release boundary

Implement and verify on `develop`, with Vercel Preview. No main merge, production deployment, production CMS writes, Convex migration or new paid service is authorized by this refresh.
