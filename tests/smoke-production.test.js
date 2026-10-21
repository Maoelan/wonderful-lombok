import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { runSmoke } from '../scripts/smoke-production.mjs';

const languages = ['en', 'zh-Hans', 'zh-Hant', 'nl', 'fr', 'de', 'id-ID', 'ms'];

function page(base, pathname = '/') {
  const alternates = languages.map((code) => `<link rel="alternate" hreflang="${code}" href="${base}${pathname}" />`).join('');
  return `<!doctype html><html><head><link rel="canonical" href="${base}${pathname}" />${alternates}<link rel="alternate" hreflang="x-default" href="${base}${pathname}" /></head><body>Wonderful Lombok</body></html>`;
}

function startServer({ adminStatus = 401, rental = false } = {}) {
  const server = http.createServer((request, response) => {
    const base = `http://${request.headers.host}`;
    const send = (status, body, headers = {}) => {
      response.writeHead(status, {
        'content-type': 'text/html; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'geolocation=(self)',
        ...headers
      });
      response.end(body);
    };

    if (request.url === '/') return send(200, page(base).replace('</body>', `${rental ? '<section id="rental"></section>' : ''}</body>`));
    if (request.url === '/en') return send(200, page(base, '/en'));
    if (request.url === '/robots.txt') return send(200, `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, { 'content-type': 'text/plain; charset=utf-8' });
    if (request.url === '/sitemap.xml') return send(200, `<?xml version="1.0"?><urlset><url><loc>${base}/</loc></url><url><loc>${base}/en</loc></url></urlset>`, { 'content-type': 'application/xml; charset=utf-8' });
    if (request.url === '/admin') return send(303, '', { location: '/login', 'x-robots-tag': 'noindex, nofollow' });
    if (request.url === '/api/admin/bookings') return send(adminStatus, JSON.stringify({ error: 'Sesi admin tidak valid.' }), { 'content-type': 'application/json', 'x-robots-tag': 'noindex, nofollow' });
    if (request.url === '/login') return send(200, page(base, '/login'), { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' });
    return send(404, 'Not found');
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

test('production smoke accepts a hardened read-only deployment', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const result = await runSmoke({ baseUrl });
    assert.deepEqual(result.results.filter((item) => !item.passed), []);
    assert.equal(result.ok, true);
  } finally {
    await close(server);
  }
});

test('production smoke fails when the admin API is publicly readable', async () => {
  const { server, baseUrl } = await startServer({ adminStatus: 200 });
  try {
    const result = await runSmoke({ baseUrl });
    assert.equal(result.ok, false);
    assert.equal(result.results.find((item) => item.name === 'admin API rejects unauthenticated requests')?.passed, false);
  } finally {
    await close(server);
  }
});

test('production smoke fails when disabled rental content is public', async () => {
  const { server, baseUrl } = await startServer({ rental: true });
  try {
    const result = await runSmoke({ baseUrl });
    assert.equal(result.ok, false);
    assert.equal(result.results.find((item) => item.name === 'rental section is not public')?.passed, false);
  } finally {
    await close(server);
  }
});
