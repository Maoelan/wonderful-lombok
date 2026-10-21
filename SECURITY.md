# Security notes

This document records the security decisions that support the launch hardening work in Issue #6. It does not contain secret values.

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
- booking status changes: 240 requests per hour per admin.

A limited response includes `Retry-After` in seconds.

Client address keys are derived from `getClientAddress()` (the adapter-vercel `x-forwarded-for` value). The right-most value is used, and it must parse as an IP address; anything else maps to `unknown`. Vercel overwrites `x-forwarded-for` with the client address. When self-hosting, configure the reverse proxy to overwrite or append the real client address and block direct access to the app port, otherwise a client can forge the right-most hop.

The limiter is per serverless instance. It reduces accidental abuse and simple scripted attacks, but it is not a shared counter. A production deployment should add a platform-level WAF or shared store (for example Vercel WAF or Upstash Redis) in front of login, booking, geocoding, routing, upload, and admin mutation endpoints. This residual risk is accepted for the current launch until shared infrastructure is available.

The in-memory table is bounded. When it is full, new keys are rejected instead of evicting active buckets, so flooding fresh keys cannot reset an existing limit. Expired buckets are pruned when the table is full.

## Booking spam protection

Both booking forms include an off-screen `website` field that people do not see. The server rejects requests where that field is non-empty before any quote or persistence work happens.

## Secret handling

Environment variables are documented in `.env.example` (without values). Their purpose, visibility, owner, and rotation cadence are recorded in [ENVIRONMENT.md](ENVIRONMENT.md). Server-only values such as `CONVEX_SERVER_SECRET` must never be imported through `$app/env/public` or exposed in client bundles.
