import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as health } from '../src/routes/api/health/+server.js';
import { configReadiness, readinessReport } from '../src/lib/server/readiness.js';

const baseEnv = {
  PUBLIC_CONVEX_URL: 'https://example.convex.cloud',
  CONVEX_SERVER_SECRET: 'test-secret'
};

test('health endpoint reports liveness without caching or indexing', async () => {
  const response = await health();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('readiness requires the Convex configuration', () => {
  assert.equal(configReadiness(baseEnv).ready, true);
  assert.deepEqual(configReadiness({ ...baseEnv, PUBLIC_CONVEX_URL: '' }).missing, ['PUBLIC_CONVEX_URL']);
  assert.deepEqual(configReadiness({ ...baseEnv, CONVEX_SERVER_SECRET: '   ' }).missing, ['CONVEX_SERVER_SECRET']);
});

test('production readiness also requires the canonical site URL', () => {
  const production = { ...baseEnv, NODE_ENV: 'production', PUBLIC_MAPBOX_TOKEN: 'pk.test-placeholder' };

  assert.equal(configReadiness(production).ready, false);
  assert.deepEqual(configReadiness(production).missing, ['PUBLIC_SITE_URL']);
  assert.equal(configReadiness({ ...production, PUBLIC_SITE_URL: 'https://wonderful-lombok.example' }).ready, true);
});

test('production readiness requires the browser map token even when a server token exists', async () => {
  const production = { ...baseEnv, NODE_ENV: 'production', PUBLIC_SITE_URL: 'https://wonderful-lombok.example', MAPBOX_SERVER_TOKEN: 'test-server-token' };
  let calls = 0;
  const report = await readinessReport({ env: production, checkDependency: async () => { calls += 1; } });
  assert.equal(report.ready, false);
  assert.deepEqual(report.missing, ['PUBLIC_MAPBOX_TOKEN']);
  assert.equal(calls, 0);
  assert.equal(configReadiness({ ...production, PUBLIC_MAPBOX_TOKEN: '   ' }).ready, false);
  assert.equal(configReadiness({ ...production, PUBLIC_MAPBOX_TOKEN: 'pk.test-placeholder' }).ready, true);
});

test('production readiness allows server-side fallback to the public map token', () => {
  const production = { ...baseEnv, NODE_ENV: 'production', PUBLIC_SITE_URL: 'https://wonderful-lombok.example', PUBLIC_MAPBOX_TOKEN: 'pk.test-placeholder' };
  assert.equal(configReadiness(production).ready, true);
});

test('readiness checks the Convex dependency when configuration is present', async () => {
  let calls = 0;
  const report = await readinessReport({
    env: baseEnv,
    checkDependency: async () => { calls += 1; }
  });

  assert.equal(calls, 1);
  assert.equal(report.ready, true);
  assert.deepEqual(report.checks, { config: true, dependency: true });
});

test('readiness does not call Convex when configuration is missing', async () => {
  let calls = 0;
  const report = await readinessReport({
    env: { ...baseEnv, CONVEX_SERVER_SECRET: '' },
    checkDependency: async () => { calls += 1; }
  });

  assert.equal(calls, 0);
  assert.equal(report.ready, false);
  assert.deepEqual(report.checks, { config: false, dependency: null });
  assert.deepEqual(report.missing, ['CONVEX_SERVER_SECRET']);
});

test('readiness returns 503 state when the Convex dependency fails', async () => {
  const report = await readinessReport({
    env: baseEnv,
    checkDependency: async () => { throw new Error('Convex unavailable'); }
  });

  assert.equal(report.ready, false);
  assert.deepEqual(report.checks, { config: true, dependency: false });
  assert.deepEqual(report.missing, []);
});
