import { pathToFileURL } from 'node:url';

const DEFAULT_TIMEOUT_MS = 15_000;
const HREFLANG = ['en', 'zh-Hans', 'zh-Hant', 'nl', 'fr', 'de', 'id-ID', 'ms'];

function normalizeBaseUrl(value) {
  if (!value) throw new Error('SMOKE_BASE_URL is required.');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SMOKE_BASE_URL must use http or https.');
  return url.origin;
}

function header(response, name) {
  return response.headers.get(name) || '';
}

function canonical(body) {
  return /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(body)?.[1] || '';
}

function hasRental(body) {
  return /id="rental(?:-title)?"/i.test(body);
}

function hreflangLinks(body) {
  return [...body.matchAll(/<link[^>]+hreflang="([^"]+)"/gi)].map((match) => match[1]);
}

export async function runSmoke({
  baseUrl,
  expectRentalEnabled = false,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  log = () => {}
} = {}) {
  const origin = normalizeBaseUrl(baseUrl);
  const results = [];

  const check = (name, passed, detail = '') => {
    results.push({ name, passed: Boolean(passed), detail });
  };

  const request = async (path) => {
    const response = await fetchImpl(new URL(path, origin), {
      redirect: 'manual',
      headers: { accept: '*/*', 'user-agent': 'WonderfulLombokSmoke/1.0' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    return { response, body: await response.text() };
  };

  const run = async (name, fn) => {
    try {
      await fn();
    } catch (error) {
      check(name, false, error?.message || String(error));
    }
  };

  await run('homepage responds', async () => {
    const { response, body } = await request('/');
    check('homepage responds', response.status === 200, `status ${response.status}`);
    check('homepage is HTML', header(response, 'content-type').includes('text/html'));
    check('x-content-type-options is nosniff', header(response, 'x-content-type-options') === 'nosniff');
    check('x-frame-options is DENY', header(response, 'x-frame-options') === 'DENY');
    check('referrer-policy is strict', header(response, 'referrer-policy') === 'strict-origin-when-cross-origin');
    check('permissions-policy allows geolocation for self', header(response, 'permissions-policy').includes('geolocation=(self)'));
    if (origin.startsWith('https:')) check('HSTS is enabled', header(response, 'strict-transport-security').includes('max-age='));
    const canonicalUrl = canonical(body);
    check('homepage has a canonical URL', canonicalUrl.startsWith(`${origin}/`), canonicalUrl || 'missing');
    const languages = hreflangLinks(body);
    check('homepage has all language alternates', HREFLANG.every((code) => languages.includes(code)), languages.join(', '));
    check('homepage has x-default alternate', languages.includes('x-default'));
    if (expectRentalEnabled) check('rental section is visible', hasRental(body));
    else check('rental section is not public', !hasRental(body));
  });

  await run('localized homepage responds', async () => {
    const { response, body } = await request('/en');
    check('localized homepage responds', response.status === 200, `status ${response.status}`);
    check('localized homepage has the expected canonical URL', canonical(body).startsWith(`${origin}/en`));
  });

  await run('robots.txt responds', async () => {
    const { response, body } = await request('/robots.txt');
    check('robots.txt responds', response.status === 200, `status ${response.status}`);
    check('robots.txt points to the sitemap', body.toLowerCase().includes(`sitemap: ${origin}/sitemap.xml`.toLowerCase()));
  });

  await run('sitemap.xml responds', async () => {
    const { response, body } = await request('/sitemap.xml');
    check('sitemap.xml responds', response.status === 200 && header(response, 'content-type').includes('xml'), `status ${response.status}`);
    const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    check('sitemap contains public URLs', locations.length > 0);
    check('sitemap uses only the canonical origin', locations.every((location) => location.startsWith(origin)));
    check('sitemap excludes private routes', locations.every((location) => !/\/(admin|login|api)(\/|$)/.test(new URL(location).pathname)));
    if (!expectRentalEnabled) check('sitemap excludes disabled rental routes', locations.every((location) => !/\/rental(\/|$)/.test(new URL(location).pathname)));
  });

  await run('admin page is protected', async () => {
    const { response } = await request('/admin');
    const redirects = [301, 302, 303, 307, 308].includes(response.status);
    check('admin page redirects without a session', redirects || response.status === 401, `status ${response.status}`);
    check('admin page is not indexable', header(response, 'x-robots-tag').includes('noindex'));
  });

  await run('admin API is protected', async () => {
    const { response } = await request('/api/admin/bookings');
    check('admin API rejects unauthenticated requests', [401, 403].includes(response.status) || [301, 302, 303, 307, 308].includes(response.status), `status ${response.status}`);
    check('admin API is not indexable', header(response, 'x-robots-tag').includes('noindex'));
  });

  await run('login page responds', async () => {
    const { response } = await request('/login');
    check('login page responds', response.status === 200, `status ${response.status}`);
    check('login page is not indexable', header(response, 'x-robots-tag').includes('noindex'));
  });

  await run('unknown route returns 404', async () => {
    const { response } = await request('/__wonderful_lombok_smoke_not_found__');
    check('unknown route returns 404', response.status === 404, `status ${response.status}`);
  });

  for (const result of results) {
    log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}${result.passed || !result.detail ? '' : `: ${result.detail}`}`);
  }

  return { ok: results.every((result) => result.passed), results };
}

async function main() {
  const baseUrl = process.env.SMOKE_BASE_URL;
  if (!baseUrl) {
    console.error('Usage: SMOKE_BASE_URL=https://final-domain.example npm run smoke:prod');
    process.exitCode = 2;
    return;
  }
  const { ok } = await runSmoke({
    baseUrl,
    expectRentalEnabled: process.env.SMOKE_EXPECT_RENTAL === 'true',
    log: console.log
  });
  if (!ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
