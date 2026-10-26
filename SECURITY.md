# Security notes

This document records the security decisions that support the launch hardening work in Issue #6. It does not contain secret values.

## Automated security gate

Private-repository CI uses Semgrep Community Edition instead of the unavailable GitHub Code Scanning integration. The `Security / Analyze JavaScript` job runs on pull requests, pushes to `develop` and `main`, manual dispatch, and a weekly schedule. It requires only repository read access, no Semgrep account, and no production credentials. Telemetry and version checks are disabled; scanner image, community rules and Actions are pinned to immutable digests/commits.

The scan covers application JavaScript/TypeScript, Convex functions, scripts, workflow security and secret patterns. Svelte script blocks are extracted with the Svelte parser, retaining original line numbers; malformed components fail extraction. A deliberately vulnerable, unimported test fixture must produce a finding before application scanning starts. Any application finding or scanner/configuration error fails the job; there is no `continue-on-error` or baseline exclusion. JSON/SARIF reports remain private Actions artifacts for seven days, not GitHub Code Scanning uploads.

Semgrep CE is not equivalent to CodeQL or an audit: it does not provide the same cross-function analysis, and extracted Svelte scripts do not cover template-level data flow. The existing dependency audit, tracked-file secret scan, server validation tests and read-only deployment smoke tests remain separate checks. Review rules/image updates before changing their pins. Branch rules should require `Test, audit, and build`, `Analyze JavaScript` from this Security workflow, and the Vercel deployment; an obsolete CodeQL-specific required check must be deliberately replaced, not bypassed.

## Admin origin checks

Every unsafe request (`POST`, `PUT`, `PATCH`, `DELETE`) must send an `Origin` header that exactly matches an approved origin. The approved origins are:

- the canonical `PUBLIC_SITE_URL` origin in production;
- the request origin in development or when `PUBLIC_SITE_URL` is not configured.

Admin, login, and logout mutations require the header. A missing Origin is rejected there. `Origin: null`, malformed values, and cross-origin values are rejected everywhere. Public booking (`POST /api/bookings`) may omit Origin, but a supplied Origin must still match.

Origin checks rely on the platform-controlled request URL. Do not deploy behind a reverse proxy that forwards a client-controlled `Host` header without sanitizing it. Canonical-host enforcement is tracked separately in F4.

## Admin sessions

- Production cookie name: `__Host-wl_admin_session`.
- Flags: `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`.
- TTL: 8 hours, refreshed only by a new login.
- Login rotates the token and destroys any session cookie that was already present, so a pre-set cookie cannot survive authentication.
- `admin:upsert` invalidates every session for the affected admin when a password changes.
- `admin:remove` deletes the admin account and its sessions. Run it with `npm run admin:revoke` while `ADMIN_USERNAME` is set.
- `admin:create` prints how many sessions were invalidated when it updates an existing account.

## Rate limits and abuse controls

Rate limits are enforced in process memory with these rules:

- login: 10 attempts per 15 minutes per client address;
- booking: 8 requests per hour per client address;
- geocoding: 60 requests per hour per client address;
- routing: 120 requests per hour per client address;
- uploads: 30 requests per hour per admin;
- catalog saves: 120 requests per hour per admin;
- booking status changes: 240 requests per hour per admin;
- booking exports: 20 requests per hour per admin;
- booking deletions: 60 requests per hour per admin.

A limited response includes `Retry-After` in seconds.

Client address keys are derived from `getClientAddress()` (the adapter-vercel `x-forwarded-for` value). The right-most value is used, and it must parse as an IP address; anything else maps to `unknown`. Vercel overwrites `x-forwarded-for` with the client address. When self-hosting, configure the reverse proxy to overwrite or append the real client address and block direct access to the app port, otherwise a client can forge the right-most hop.

The limiter is per serverless instance. It reduces accidental abuse and simple scripted attacks, but it is not a shared counter. A production deployment should add a platform-level WAF or shared store (for example Vercel WAF or Upstash Redis) in front of login, booking, geocoding, routing, upload, and admin mutation endpoints. This residual risk is accepted for the current launch until shared infrastructure is available.

The in-memory table is bounded. When it is full, new keys are rejected instead of evicting active buckets, so flooding fresh keys cannot reset an existing limit. Expired buckets are pruned when the table is full.

## Booking spam protection

Both booking forms include an off-screen `website` field that people do not see. The server rejects requests where that field is non-empty before any quote or persistence work happens.

## Uploaded image metadata

Admin uploads are limited to JPEG, PNG, and WebP, checked against their declared MIME type and magic bytes, and capped at 5 MB per file and 5.5 MB per multipart request. Before the bytes are sent to Convex storage, JPEG EXIF/XMP/IPTC/comment segments, PNG `eXIf` and text chunks, and WebP `EXIF`/`XMP` chunks are removed. A JPEG orientation value is preserved with a minimal EXIF segment so phone photos are not rotated unexpectedly. Malformed images are rejected instead of being stored with their metadata.

This is a structural metadata filter, not a full image decoder or a malware scanner. Keep the upload endpoint admin-only, origin-checked, and rate-limited.

When a catalog save succeeds, Convex storage IDs that were in the previous catalog but are absent from the new catalog are deleted. A file is kept if the same storage URL still appears anywhere in the saved catalog, including links or URLs inside rich text. Cleanup failures are ignored so they cannot roll back a successful catalog save. Deletion is permanent and cannot be undone; admin confirmations call this out, and `PRIVACY.md` records the operational procedure.

## Booking data access

Booking records contain customer name, WhatsApp number, travel details, and travel coordinates. They are available only to authenticated admins. The CSV export route sends `Cache-Control: no-store` and is rate-limited. Deleting a booking requires an authenticated admin, a trusted `Origin`, and an explicit confirmation in the admin UI; the mutation removes the booking and its idempotency record. The full data inventory, retention target, and export/deletion procedure are in [PRIVACY.md](PRIVACY.md).

## Secret handling

Environment variables are documented in `.env.example` (without values). Their purpose, visibility, owner, and rotation cadence are recorded in [ENVIRONMENT.md](ENVIRONMENT.md). Server-only values such as `CONVEX_SERVER_SECRET` must never be imported through `$app/env/public` or exposed in client bundles.
