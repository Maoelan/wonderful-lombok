# Environment and credential inventory

This document records the non-secret inventory of environment variables, accounts, and credentials used by Wonderful Lombok. It contains no values. Never add a real token, password, deployment key, customer record, or backup archive here.

## Ownership roles

- **Project owner** — the client or business owner. Approves production access, the final domain, retention decisions, and launch.
- **Deployment operator** — manages Convex, Vercel, GitHub, DNS, and the deployment environment.
- **Security responder** — executes the incident procedure. This is the deployment operator until a separate person is named.
- **Content admin** — uses the admin panel. This role does not receive infrastructure credentials.

Named people must be confirmed with the client before launch. This repository cannot infer account owners.

## Runtime variables

| Variable | Required | Visibility | Purpose | Owner | Rotation or change |
| --- | --- | --- | --- | --- | --- |
| `PUBLIC_CONVEX_URL` | Yes | Browser-visible by design; it is an endpoint, not a secret | Convex HTTP API endpoint used by the app and scripts | Deployment operator | Change only with the Convex deployment. Recheck after a deployment move. |
| `CONVEX_SERVER_SECRET` | Yes | Server-only | Authenticates server requests and local admin scripts to Convex functions | Security responder | Rotate every 90 days, after a staff or access change, and immediately on suspected exposure. Update Convex and the hosting environment together, then redeploy. |
| `PUBLIC_RENTAL_ENABLED` | Yes | Browser-visible config | Feature flag for public rental content | Project owner | Change only with explicit business approval. Keep `false` until rentals are approved. |
| `BODY_SIZE_LIMIT` | Yes | Server config | Maximum multipart request size accepted by the runtime. Use `4.5M`; application limits are 4 MB per file and 4.4 MB per request. | Deployment operator | Review whenever upload limits or the platform request ceiling change. Keep it above the per-file limit but below the hosting limit. |
| `PUBLIC_SITE_URL` | Yes in production | Server config; its value appears in public canonical URLs | Final canonical HTTPS origin, without a trailing slash | Deployment operator | Change when the final domain is approved. Recheck DNS, canonical URLs, sitemap, and webmaster properties afterwards. |
| `PUBLIC_MAPBOX_TOKEN` | Yes for the browser map; also when `MAPBOX_SERVER_TOKEN` is empty | Public by design; exposed to the browser map and used server-side in this local demo | Mapbox GL JS browser map, plus Mapbox Search Box API place search with a Geocoding API v5 fallback and Directions API v5 route calculation | Project owner | Use a public `pk.` token with URL and scope restrictions. It is not a secret; never use a secret `sk.` token here. Rotate on suspected exposure. |
| `MAPBOX_SERVER_TOKEN` | Optional | Server-only | Mapbox Search Box API place search with a Geocoding API v5 fallback and Directions API v5 route calculation; takes precedence over `PUBLIC_MAPBOX_TOKEN` | Security responder | Use a secret `sk.` token scoped to Search Box, Geocoding, and Directions. Never expose it in the browser, public bundles, logs, or screenshots. Rotate every 90 days and immediately on suspected exposure. |
| `GOOGLE_SITE_VERIFICATION` | Optional | Browser-visible by design | Google Search Console HTML verification token | Project owner or webmaster | Replace when the property or verification method changes. This is a verification token, not an application secret. |
| `BING_SITE_VERIFICATION` | Optional | Browser-visible by design | Bing Webmaster Tools HTML verification token | Project owner or webmaster | Replace when the property or verification method changes. This is a verification token, not an application secret. |

`NODE_ENV` is managed by the hosting platform and is not a credential.

## Local and CI-only variables

| Variable | Visibility | Purpose | Owner | Rotation or change |
| --- | --- | --- | --- | --- |
| `ADMIN_USERNAME` | Secret-adjacent; never publish | Local admin creation and revocation scripts | Project owner | Change when admin access changes. Always pair with a password rotation. |
| `ADMIN_PASSWORD` | Secret | Prompt-free local admin creation | Project owner | Rotate every 90 days, after a staff change, and immediately on suspected exposure. Never put it in hosting settings. |
| `ADMIN_INITIAL_PASSWORD` | Secret | Staging-only login for `npm run test:auth` | Deployment operator | Use only a temporary test account. Change per test environment. Never use a production admin. |
| `APP_URL` | Not secret | Base URL for the local or staging auth smoke test | Deployment operator | Change with the test target. |
| `APP_ORIGIN` | Not secret | Expected origin for the auth smoke test | Deployment operator | Must match the test target. |
| `SMOKE_BASE_URL` | Not secret | Read-only production smoke target | Deployment operator | Change only when the final domain changes. |
| `CONVEX_DEPLOY_KEY` | Secret | Non-interactive Convex deployment from CI or an operator workstation | Deployment operator | Rotate every 90 days and immediately on exposure. Never expose it to the client bundle or logs. |
| `VERCEL_TOKEN` | Secret | Non-interactive Vercel deployment or project automation, if used | Deployment operator | Rotate every 90 days and immediately on exposure. Never expose it to the client bundle or logs. |
| GitHub Actions secrets and personal access tokens | Secret | CI, CodeQL, release automation, and issue administration | Deployment operator | Prefer short-lived or fine-grained tokens. Rotate every 90 days, revoke when the task ends, and never print them in logs. |

## Browser map rendering

The public planner renders its map in the browser with Mapbox GL JS and the
Mapbox Streets style (`mapbox://styles/mapbox/streets-v12`). It uses
`PUBLIC_MAPBOX_TOKEN`, a public `pk.` token that is browser-visible by design,
and does not use Leaflet. Style and
tile requests go to `api.mapbox.com`, `events.mapbox.com`, and
`*.tiles.mapbox.com`, and the map displays Mapbox and OpenStreetMap attribution.

Restrict the public token to the intended origins (including
`http://127.0.0.1:5173` for local development), scope it to the styles and
services in use, and set usage limits. A public token cannot be treated as a
secret; never substitute a secret `sk.` token in the browser map. The map fails
with a provider-neutral message when the token is missing, rejected, over
quota, or the network is unavailable.

## Mapbox services

The public planner uses Mapbox for the browser map, server-side place search,
and route calculation. The browser map uses Mapbox GL JS and needs
`PUBLIC_MAPBOX_TOKEN`. The server uses `MAPBOX_SERVER_TOKEN` when it is set;
otherwise it falls back to `PUBLIC_MAPBOX_TOKEN` for this local demo.

| Service | Used by | Token | Billing and quota notes |
| --- | --- | --- | --- |
| Search Box API | Lombok-bounded place, POI, and category search through `/api/geocode` | `MAPBOX_SERVER_TOKEN` or `PUBLIC_MAPBOX_TOKEN` | Uses the `/forward` endpoint with a Lombok bounding box, `country=id`, and the request locale. This covers POIs and category terms such as `kfc` and `pantai`. Set usage limits and billing alerts. |
| Geocoding API v5 | Fallback for addresses and place names that Search Box does not return through `/api/geocode` | `MAPBOX_SERVER_TOKEN` or `PUBLIC_MAPBOX_TOKEN` | Only called when Search Box returns no Lombok results. Requests are restricted to Lombok and `country=id`. Set usage limits and billing alerts. |
| Directions API v5 | Two-point driving route, duration, and GeoJSON geometry through `/api/route` and booking verification | `MAPBOX_SERVER_TOKEN` or `PUBLIC_MAPBOX_TOKEN` | Requests use the `mapbox/driving` profile, `exclude=ferry`, and full GeoJSON steps. Every step must be `driving`; a route that snaps a selected point more than 250 m from the road network is rejected. |

A public `pk.` token is acceptable for this local demo, but it is visible by design
and should be URL- and scope-restricted. For production or shared use, configure a
secret `sk.` token in `MAPBOX_SERVER_TOKEN` and keep it server-only. Mapbox account
billing, usage limits, URL restrictions, and token scopes are dashboard-only
controls and cannot be verified from this repository.

## Account and data-store inventory

| Asset | What it controls | Owner | Required controls |
| --- | --- | --- | --- |
| Convex production deployment | Catalog, bookings, admin accounts, sessions, file storage, function logs | Deployment operator | Limited dashboard access, MFA on the owning account, deploy-key rotation, export before risky changes |
| Convex development or staging deployment | Non-production testing and destructive QA | Deployment operator | Separate from production, no production data or secret reuse, disposable data |
| Vercel project and domains | Hosting, runtime environment variables, preview deployments, DNS integration | Project owner and deployment operator | MFA, restricted team access, production environment protection, deploy-token rotation |
| DNS registrar | Domain ownership and records | Project owner | MFA, registrar lock, recovery codes stored offline |
| GitHub repository and Actions | Source, CI, CodeQL, branch protection, deployment automation | Project owner | MFA, least-privilege access, protected branches, secret scanning and push protection where available |
| Convex `admins` records | Admin login and password hashes | Project owner | Unique named accounts, 12+ character passwords, prompt revocation, session invalidation on password change |
| Google Search Console and Bing Webmaster | Search verification and indexing diagnostics | Project owner | MFA, named owners, verification-token replacement on property changes |
| Backup archives | Catalog and booking recovery | Deployment operator | Encrypted storage outside the repository, access list, retention limit, tested restore |
| Mapbox account | Search Box API, Geocoding API v5 fallback, Directions API v5, token scopes, URL restrictions, usage limits, and billing | Project owner and deployment operator | MFA on the owning account, minimum scopes, URL restrictions on public tokens, usage limits, billing alerts, and token rotation |
| Wikimedia Commons | Public destination and package imagery | No account credential | Respect the applicable license and attribution requirements; no API key is stored in this repository |

## Browser-visible and server-only data

**Browser-visible by design:**

- `PUBLIC_CONVEX_URL` and the resulting Convex API endpoint;
- `PUBLIC_RENTAL_ENABLED` as an implementation detail, not as a secret;
- `PUBLIC_MAPBOX_TOKEN`, a public `pk.` token that is not a secret; it is exposed to the Mapbox GL JS browser map and this local demo also uses it for server-side Mapbox calls, and it must not be replaced with a secret `sk.` token;
- public Mapbox style and tile requests, which include only the public token, plus Mapbox and OpenStreetMap attribution;
- search-engine verification tokens in public HTML;
- public catalog content, contact details, and canonical URLs.

**Server-only:**

- `CONVEX_SERVER_SECRET`;
- `MAPBOX_SERVER_TOKEN`, when configured, which must be a secret `sk.` token;
- `CONVEX_DEPLOY_KEY`, `VERCEL_TOKEN`, GitHub tokens, and Actions secrets;
- admin usernames and password hashes, except the username typed into the login form;
- session tokens, which are stored in an `HttpOnly` cookie and must not be logged;
- environment files other than `.env.example`;
- backup archives, database exports, logs containing customer data, and deployment metadata.

Never import a server-only value through a publicly exposed module or prefix. A public build, source map, error page, or log must not contain a server secret.

## Rotation baseline

- Rotate `CONVEX_SERVER_SECRET`, `PUBLIC_MAPBOX_TOKEN`, `MAPBOX_SERVER_TOKEN`, deployment keys, Vercel tokens, and GitHub tokens every 90 days.
- Rotate admin passwords every 90 days, after an admin leaves, and immediately on suspected exposure.
- Rotate immediately after a lost device, unexpected deployment, exposed archive, or suspicious login.
- After rotation, invalidate existing sessions, redeploy the application, confirm the old credential no longer works, and record the date and owner without recording the value.
- Staging and production must use separate deployments, storage, and secrets. Never copy a production secret into staging.
- The client must confirm the final owners and cadence before launch.

## Open items that require dashboard access

- Name the people behind each ownership role and confirm MFA and recovery methods.
- Confirm that staging and production use separate credentials, databases, storage, and API access.
- Confirm Mapbox public-token URL restrictions, Search Box/Geocoding/Directions scopes, usage limits, billing alerts, and whether production should use a secret `sk.` token instead.
- Complete a full-history, build-output, source-map, and deployment-log secret scan.
- Rotate any credential that may have been exposed and prove that the old credential fails.
- Verify the documented backup and restore path on a non-production deployment.
