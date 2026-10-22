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
| `BODY_SIZE_LIMIT` | Yes | Server config | Maximum multipart request size accepted by the runtime | Deployment operator | Review whenever upload limits change. Keep it above the per-file limit but bounded. |
| `PUBLIC_SITE_URL` | Yes in production | Server config; its value appears in public canonical URLs | Final canonical HTTPS origin, without a trailing slash | Deployment operator | Change when the final domain is approved. Recheck DNS, canonical URLs, sitemap, and webmaster properties afterwards. |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Yes in production | Browser-visible by design; the key must be restricted | Google Maps JavaScript API key used to draw the public planner map | Project owner | Use a separate Google Cloud key restricted to Maps JavaScript API and the approved production and preview HTTP referrers. Rotate every 90 days, after a referrer change, and immediately on suspected exposure. Never reuse the server key. |
| `GOOGLE_MAPS_SERVER_API_KEY` | When `MAP_PROVIDER=google` | Server-only | Google Places API (New) place search and Google Routes API route calculation | Security responder | Use a separate Google Cloud key restricted to Places API (New) and Routes API. Do not add browser referrers. Rotate every 90 days, after a service-account or access change, and immediately on suspected exposure. Update Vercel and redeploy. |
| `MAP_PROVIDER` | No | Server config | Selects `google` (default) or `mapbox` for browser maps, place search, and route calculation | Deployment operator | Use one provider at a time. Keep both credential sets configured before switching so a rollback does not break search or routing. |
| `PUBLIC_MAPBOX_TOKEN` | When `MAP_PROVIDER=mapbox` | Browser-visible by design; it must be URL-restricted | Mapbox GL JS browser map, markers, and route rendering | Project owner | Use a public `pk.` token restricted to the approved production and preview URLs and to the styles/tiles scopes needed by the map. Rotate every 90 days, after a URL change, and immediately on suspected exposure. Never use a secret `sk.` token in the browser. |
| `MAPBOX_SERVER_TOKEN` | When `MAP_PROVIDER=mapbox` | Server-only | Mapbox Geocoding API v5 place search and Directions API v5 route calculation | Security responder | Use a secret `sk.` token scoped only to Geocoding and Directions. Never expose it in the browser, public bundles, logs, or screenshots. Rotate every 90 days and immediately on suspected exposure. |
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

## Google Maps Platform services

The public planner requires these Google Cloud APIs in the project that owns both keys:

| Service | Used by | Key | Billing and quota notes |
| --- | --- | --- | --- |
| Maps JavaScript API | Browser map rendering, markers, and route polyline | `PUBLIC_GOOGLE_MAPS_API_KEY` | Enable only for the restricted browser key. Set a daily quota and a budget alert before launch. |
| Places API (New) | Locale-aware place and address search through `/api/geocode` | `GOOGLE_MAPS_SERVER_API_KEY` | Text Search requests use a Lombok rectangle restriction and `regionCode: ID`. Set a daily request quota and a budget alert. |
| Routes API | Multi-stop driving distance, duration, and encoded route geometry through `/api/route` and booking verification | `GOOGLE_MAPS_SERVER_API_KEY` | Routes are calculated on the server with `DRIVE` and `TRAFFIC_UNAWARE`. Set a daily request quota and a budget alert. |

Do not enable unrelated Google APIs on either key. The browser key must have HTTP referrer restrictions for the production host and approved preview hosts. The server key must not be exposed to the browser, must not have HTTP referrer restrictions, and should be restricted to the two server APIs above. Google Cloud billing, quota limits, and budget alerts are dashboard-only controls and cannot be verified from this repository.

## Mapbox services

Set `MAP_PROVIDER=mapbox` to use Mapbox instead of Google. The public planner then requires:

| Service | Used by | Token | Billing and quota notes |
| --- | --- | --- | --- |
| Mapbox GL JS and the selected map style | Browser map rendering, markers, and route polyline | `PUBLIC_MAPBOX_TOKEN` | Use a public token with URL restrictions and the minimum styles/tiles scopes. Set account usage limits and billing alerts before launch. |
| Geocoding API v5 | Lombok-bounded place and address search through `/api/geocode` | `MAPBOX_SERVER_TOKEN` | Requests are restricted to Lombok and `country=id`. Use a secret token with Geocoding scope only. Set usage limits and billing alerts. |
| Directions API v5 | Two-point driving route, duration, and GeoJSON geometry through `/api/route` and booking verification | `MAPBOX_SERVER_TOKEN` | Requests use the `mapbox/driving` profile, `exclude=ferry`, and full GeoJSON steps. Every step must be `driving`; a route that snaps a selected point more than 250 m from the road network is rejected. |

Do not use a `pk.` public token as the production server credential. A public token is visible to every visitor and can be abused even when the map is working correctly. The server token must be a secret `sk.` token with only Geocoding and Directions scopes. Mapbox account billing, usage limits, token URL restrictions, and secret scopes are dashboard-only controls and cannot be verified from this repository.

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
| Google Maps Platform project | Maps JavaScript API, Places API (New), Routes API, billing, quotas, and key restrictions | Project owner and deployment operator | MFA on the owning account, separate browser and server keys, API restrictions, referrer restrictions, daily quotas, budget alerts, and key rotation |
| Mapbox account | Map styles, Geocoding API v5, Directions API v5, token scopes, URL restrictions, usage limits, and billing | Project owner and deployment operator | MFA on the owning account, separate public and secret tokens, minimum scopes, URL restrictions on the public token, usage limits, billing alerts, and token rotation |
| Wikimedia Commons | Public destination and package imagery | No account credential | Respect the applicable license and attribution requirements; no API key is stored in this repository |

## Browser-visible and server-only data

**Browser-visible by design:**

- `PUBLIC_CONVEX_URL` and the resulting Convex API endpoint;
- `PUBLIC_RENTAL_ENABLED` as an implementation detail, not as a secret;
- `PUBLIC_GOOGLE_MAPS_API_KEY`, which is restricted to the Maps JavaScript API and approved HTTP referrers;
- `PUBLIC_MAPBOX_TOKEN`, which is a public `pk.` token restricted to Mapbox GL JS and approved URLs;
- search-engine verification tokens in public HTML;
- public catalog content, contact details, and canonical URLs.

**Server-only:**

- `CONVEX_SERVER_SECRET`;
- `GOOGLE_MAPS_SERVER_API_KEY`;
- `MAPBOX_SERVER_TOKEN`, which must be a secret `sk.` token in production;
- `CONVEX_DEPLOY_KEY`, `VERCEL_TOKEN`, GitHub tokens, and Actions secrets;
- admin usernames and password hashes, except the username typed into the login form;
- session tokens, which are stored in an `HttpOnly` cookie and must not be logged;
- environment files other than `.env.example`;
- backup archives, database exports, logs containing customer data, and deployment metadata.

Never import a server-only value through a publicly exposed module or prefix. A public build, source map, error page, or log must not contain a server secret.

## Rotation baseline

- Rotate `CONVEX_SERVER_SECRET`, both Google Maps keys, both Mapbox tokens, deployment keys, Vercel tokens, and GitHub tokens every 90 days.
- Rotate admin passwords every 90 days, after an admin leaves, and immediately on suspected exposure.
- Rotate immediately after a lost device, unexpected deployment, exposed archive, or suspicious login.
- After rotation, invalidate existing sessions, redeploy the application, confirm the old credential no longer works, and record the date and owner without recording the value.
- Staging and production must use separate deployments, storage, and secrets. Never copy a production secret into staging.
- The client must confirm the final owners and cadence before launch.

## Open items that require dashboard access

- Name the people behind each ownership role and confirm MFA and recovery methods.
- Confirm that staging and production use separate credentials, databases, storage, and API access.
- Confirm Google Maps Platform billing, daily quotas, budget alerts, and browser/server key restrictions in the owning Google Cloud project.
- Confirm Mapbox public-token URL restrictions, secret-token Geocoding/Directions scopes, usage limits, billing alerts, and a production `sk.` token in the owning Mapbox account.
- Complete a full-history, build-output, source-map, and deployment-log secret scan.
- Rotate any credential that may have been exposed and prove that the old credential fails.
- Verify the documented backup and restore path on a non-production deployment.
