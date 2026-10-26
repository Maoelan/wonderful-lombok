# Wonderful Lombok Launch Checklist

Use this checklist for every production release. It complements [SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), and [SEO-LAUNCH-CHECKLIST.md](SEO-LAUNCH-CHECKLIST.md). Never place secret values, customer data, or production exports in this repository.

## 1. Before deployment

- [ ] Record the release commit SHA, branch, and owner approval; confirm the working tree is clean.
- [ ] Run `npm ci`.
- [ ] Run `npm test`; all tests must pass.
- [ ] Run `npm audit --audit-level=high`; record accepted residual findings.
- [ ] Run the production build on Linux CI (`npm run build`). A local Windows build can stop at the Vercel adapter symlink step; that is an environment limitation, not a reason to skip CI.
- [ ] Confirm CI and CodeQL are green for the release commit, or attach an explanation for any skipped job.
- [ ] Run `npm run scan:secrets`; CI runs the same high-confidence tracked-file scan. Keep repository secret scanning and push protection enabled where available.
- [ ] Set `PUBLIC_SITE_URL` to the final HTTPS origin, without a trailing slash.
- [ ] Confirm `PUBLIC_RENTAL_ENABLED=false` unless the owner has explicitly approved rentals for this release.
- [ ] Confirm `PUBLIC_CONVEX_URL`, `CONVEX_SERVER_SECRET`, and `BODY_SIZE_LIMIT=4.5M` are configured in the hosting provider, not in the repository. Uploads are capped at 4 MB per file and 4.4 MB per multipart request.
- [ ] Configure and record the production abuse-control gate: either platform rate-limit rules (for example Vercel Firewall/WAF) for login, booking, geocoding, routing, upload, and admin mutations, or a shared limiter backed by Redis/Convex. Use at least the limits in [SECURITY.md](SECURITY.md#rate-limits-and-abuse-controls). The bundled in-memory limiter is acceptable for the current showcase only; it is not a substitute for this gate in multi-instance production.
- [ ] Confirm no `.env` file, deploy key, database export, upload archive, or backup is included in the release artifact.
- [ ] Confirm the admin account and revocation path are ready; remove demo or shared admin credentials.
- [ ] Take a Convex backup/export and record the currently deployed application SHA for rollback.
- [ ] Confirm the final domain, DNS, HTTPS certificate, and host redirects are ready.

## 2. Deploy

- [ ] Deploy the Convex functions and schema before the application: `npx convex deploy`. The admin save path requires `catalog:getWithRevision` and revision-aware `catalog:save`; an older deployment fails closed with `503` rather than overwriting the catalog.
- [ ] Deploy the SvelteKit application from the approved commit.
- [ ] Record the deployment URL, commit SHA, deployment time, and operator.
- [ ] Do not run `showcase:seed` against production data.

## 3. After deployment: read-only checks

Run the automated smoke test from a trusted machine:

```bash
SMOKE_BASE_URL=https://final-domain.example npm run smoke:prod
```

It sends GET requests only. It checks the homepage, a localized homepage, security headers, canonical and `hreflang` links, the health and readiness endpoints, `robots.txt`, `sitemap.xml`, the disabled rental section, the admin redirect/API boundary, and the login page. The readiness check reads the catalog through Convex; it does not mutate data.

Then verify manually, still read-only:

- [ ] Homepage, one package page, and one destination page load in Indonesian and at least one non-Indonesian locale.
- [ ] Canonical URLs and `hreflang` links use the final domain; `x-default` is present.
- [ ] `robots.txt` references the final-domain sitemap; `sitemap.xml` contains only public canonical URLs.
- [ ] The rental section and rental sitemap entries are absent while `PUBLIC_RENTAL_ENABLED=false`.
- [ ] `/api/health` returns `200` with `{"status":"ok"}`.
- [ ] `/api/ready` returns `200` with `{"status":"ready"}`. A `503` means required configuration is missing or Convex is unreachable; do not expose internal error details.
- [ ] Both health endpoints return `Cache-Control: no-store` and are marked `noindex`.
- [ ] `/admin` redirects to `/login` without a session; `/api/admin/bookings` returns `401` or `403`.
- [ ] `/admin`, `/login`, and `/api/` responses are not indexable.
- [ ] Security headers are present, including HSTS on HTTPS.
- [ ] If a WAF/shared limiter was configured, verify on staging that an over-limit login or booking request returns `429` with `Retry-After`; do not run destructive or lockout tests against production.
- [ ] An unknown route returns `404`.
- [ ] Configure the hosting uptime monitor to poll `/api/health` and alert on a non-`200` response; alert on `/api/ready` returning `503`.
- [ ] Do **not** create a booking, upload a file, change catalog data, or run destructive authentication tests on production.

Attach the smoke output, commit SHA, deployment URL, and any residual risks to the release record or Issue #6.

`npm run test:auth` is a staging-only session smoke test; it creates a real login session. Never point it at production or give it production admin credentials.

## 4. Rollback

- [ ] Redeploy the previously recorded application SHA.
- [ ] If Convex schema or data changed, restore the recorded backup/export and verify it before reopening the site.
- [ ] Re-run `SMOKE_BASE_URL=https://final-domain.example npm run smoke:prod`.
- [ ] Preserve deployment and access logs for the incident record.
- [ ] If credentials or sessions may be compromised, revoke admin access and rotate secrets before reopening.

## 5. Suspected credential or session incident

- [ ] Revoke the affected admin with `npm run admin:revoke` and confirm existing sessions are invalidated.
- [ ] Rotate the affected Convex, hosting, storage, deployment, or API credential in its provider.
- [ ] Remove the exposed artifact or archive and confirm the old credential no longer works.
- [ ] Review application, Convex, and hosting logs without copying secret values into issue comments.
- [ ] Notify the owner and record the timeline, scope, and follow-up actions.
- [ ] Follow the detailed decisions in [SECURITY.md](SECURITY.md).

## Known residual risks

- If Convex is unavailable, public catalog pages return a localized `503` maintenance page and the sitemap returns `503`. Login remains available, but catalog and booking operations require Convex.
- Rate limiting is in process memory. It is suitable for this showcase/single-instance deployment but is not a shared counter across serverless instances. Production traffic must not be enabled until the platform WAF/shared-store gate above is recorded as complete.
- Uploads abandoned before a catalog save are not automatically cleaned up; the monthly manual review in [PRIVACY.md](PRIVACY.md) remains a residual risk until scheduled cleanup is added.
- No dedicated staging environment is currently available for destructive QA; live production verification must remain read-only.
- Final canonical-domain work depends on the client's domain decision.
- The CI secret scan is a high-confidence tracked-file check, not full-history scanning. GitHub-native push protection and full-history scanning still need repository-owner setup.
- Privacy notice/consent, automated retention expiry, catalog translation persistence, and backup/restore testing remain open Issue #6 items. The booking export/deletion procedure is documented in [PRIVACY.md](PRIVACY.md).
