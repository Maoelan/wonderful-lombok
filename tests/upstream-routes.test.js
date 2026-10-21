import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as geocode } from '../src/routes/api/geocode/+server.js';
import { GET as route } from '../src/routes/api/route/+server.js';

const geocodePayload = [{
  lat: '-8.5',
  lon: '116.1',
  name: 'Kuta',
  display_name: 'Kuta, Lombok',
  addresstype: 'village',
  address: { village: 'Kuta', state: 'West Nusa Tenggara', country: 'Indonesia' }
}];

const routePayload = {
  code: 'Ok',
  routes: [{ distance: 12_100, geometry: { coordinates: [[116.1, -8.5], [116.2, -8.6]] } }],
  waypoints: [{ distance: 8 }, { distance: 16 }]
};

test('geocode returns localized results within the Lombok boundary', async () => {
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
    getClientAddress: () => '203.0.113.10',
    fetch: async () => new Response(JSON.stringify(geocodePayload), { status: 200 })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].lat, -8.5);
  assert.equal(body.results[0].lng, 116.1);
});

test('geocode returns a localized outage instead of an empty success', async () => {
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
    getClientAddress: () => '203.0.113.11',
    fetch: async () => new Response('down', { status: 503 })
  });

  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, 'Place search failed.');
});

test('route retries one transient upstream outage', async () => {
  let calls = 0;
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.5&fromLng=116.1&toLat=-8.6&toLng=116.2&fromAccuracy=20&lang=en'),
    getClientAddress: () => '203.0.113.12',
    fetch: async () => {
      calls += 1;
      return new Response(JSON.stringify(calls === 1 ? { code: 'Error' } : routePayload), { status: calls === 1 ? 503 : 200 });
    }
  });

  assert.equal(response.status, 200);
  assert.equal(calls, 2);
  assert.equal((await response.json()).code, 'Ok');
});

test('route reports a persistent upstream outage as a service error', async () => {
  let calls = 0;
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.5&fromLng=116.1&toLat=-8.6&toLng=116.2&fromAccuracy=20&lang=en'),
    getClientAddress: () => '203.0.113.13',
    fetch: async () => {
      calls += 1;
      return new Response(JSON.stringify({ code: 'Error' }), { status: 503 });
    }
  });

  assert.equal(response.status, 502);
  assert.equal(calls, 2);
  assert.equal((await response.json()).error, 'The routing service cannot be reached right now. Please try again shortly.');
});
