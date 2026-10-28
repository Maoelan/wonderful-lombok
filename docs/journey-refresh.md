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

## Verification and visual review

- 258 automated tests pass; production build and tracked-file secret scan pass.
- Live Preview checked in all eight locales at 320 px, plus Indonesian at 390, 768 and 1440 px. No document horizontal overflow. All 33 package-dialog open/close checks pass, including focus entry and Escape dismissal.
- The homepage calculator renders a map canvas and one introduction. Mobile destination and package detail pages show the new media and retain their content and navigation.
- Screenshot review identified excess space under the mobile hero actions and cramped native date segments at 320 px. The hero now bottom-aligns its content; the booking date and participant fields stack below 361 px.
- Local browser captures redirected by a stale local canonical URL were excluded. Evidence uses the actual `develop` Vercel Preview, not those captures.

ROUND 1
Seen in one second: a south-coast bay and a concrete Lombok trip invitation.
Idea (one sentence): compare three local tour experiences, then check a transfer without leaving the homepage.
Live thing: destination navigation, package booking dialogs and the transfer calculator.
Layout words by section: hero=full-bleed / packages=equal-grid / destinations=photo-strip / transfer=working-form / about=split / FAQ=disclosure-list.
Scores: design 7 · usability 8 · creativity 6 · content 7 → overall 6.0 (capped).
Caps applied: the strict visual inspector still reports shadow and eyebrow heuristics; no clean inspector pass is claimed. The approach remains a familiar travel-operator layout, not a novel editorial concept.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. `home-390.jpg`: unused dark area below the hero actions. Fixed by setting the mobile flex main-axis alignment explicitly.
2. `booking-320.jpg`: narrow native date segments. Fixed by stacking the form row on narrow phones, retaining dialog scrolling.
3. `preview-round-1/desktop-page-01.jpg`: the map is blank in the early full-page capture because it had not loaded. The dedicated calculator check scrolls it into view and confirms the rendered map canvas. No blank-map image substitutes for the interactive map.

Remaining limitations: images are illustrative rather than location-verified; replace them before a commercial launch. Floating navigation overlays and functional labels trigger the skill's generic design heuristics. This is not a new Lighthouse or accessibility certification, and booking submissions were not sent to the operator during read-only visual QA.
