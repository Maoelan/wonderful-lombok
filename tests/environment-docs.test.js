import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
const environmentDoc = readFileSync(new URL('../ENVIRONMENT.md', import.meta.url), 'utf8');

test('documents every variable in .env.example', () => {
  const keys = [...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]);

  assert.ok(keys.length > 0, 'expected variables in .env.example');
  for (const key of keys) {
    assert.match(environmentDoc, new RegExp(`\\b${key}\\b`), `${key} must be documented in ENVIRONMENT.md`);
  }
});

test('documents local-only and CI credentials that are not in .env.example', () => {
  for (const key of ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_INITIAL_PASSWORD', 'CONVEX_DEPLOY_KEY', 'VERCEL_TOKEN']) {
    assert.match(environmentDoc, new RegExp(`\\b${key}\\b`), `${key} must be documented in ENVIRONMENT.md`);
  }
});

test('separates browser-visible values from server-only values', () => {
  assert.match(environmentDoc, /Browser-visible by design/);
  assert.match(environmentDoc, /Server-only/);
  assert.match(environmentDoc, /`CONVEX_SERVER_SECRET`/);
  assert.match(environmentDoc, /HttpOnly/);
});

test('documents the Mapbox GL browser map and its public token', () => {
  for (const term of ['Mapbox GL JS', 'mapbox://styles/mapbox/streets-v12', 'PUBLIC_MAPBOX_TOKEN', 'OpenStreetMap']) {
    assert.match(environmentDoc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), term);
  }
  assert.doesNotMatch(environmentDoc, /maplibre|carto/i);
  assert.doesNotMatch(envExample, /maplibre|carto/i);
  assert.doesNotMatch(environmentDoc, /PUBLIC_GOOGLE_MAPS_API_KEY/);
  assert.doesNotMatch(envExample, /PUBLIC_GOOGLE_MAPS_API_KEY/);
});

test('documents Mapbox as the only server-side map provider and the token separation', () => {
  for (const term of ['PUBLIC_MAPBOX_TOKEN', 'MAPBOX_SERVER_TOKEN', 'Search Box API', 'Geocoding API v5', 'Directions API v5', 'public `pk.` token', 'secret `sk.` token', 'usage limits']) {
    assert.match(environmentDoc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), term);
  }
  assert.match(environmentDoc, /`PUBLIC_MAPBOX_TOKEN`[\s\S]*not a secret/i);
  assert.match(environmentDoc, /`MAPBOX_SERVER_TOKEN`[\s\S]*Server-only/);
  assert.doesNotMatch(envExample, /PUBLIC_MAPBOX_TOKEN=.*[A-Za-z0-9]{20}/);
  assert.doesNotMatch(envExample, /GOOGLE_MAPS_SERVER_API_KEY|MAP_PROVIDER/);
  assert.doesNotMatch(environmentDoc, /GOOGLE_MAPS_SERVER_API_KEY|MAP_PROVIDER/);
});
