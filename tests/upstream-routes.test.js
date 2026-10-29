import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as geocode } from '../src/routes/api/geocode/+server.js';
import { GET as route, POST as multiStopRoute } from '../src/routes/api/route/+server.js';
import { getFormCopy } from '../src/lib/i18n.js';

process.env.MAPBOX_SERVER_TOKEN = 'test-server-token';

const geocodePayload = {
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [116.277504, -8.893241] },
      properties: {
        mapbox_id: 'place-kuta',
        name: 'Kuta',
        full_address: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [115.22, -8.65] },
      properties: {
        mapbox_id: 'place-bali',
        name: 'Denpasar',
        full_address: 'Denpasar, Bali, Indonesia'
      }
    }
  ]
};

const routePayload = {
  waypoints: [
    { distance: 0, location: [116.1, -8.5] },
    { distance: 0, location: [116.2, -8.6] }
  ],
  routes: [{
    distance: 12_100,
    duration: 1_800,
    geometry: {
      type: 'LineString',
      coordinates: [[116.1, -8.5], [116.2, -8.6]]
    },
    legs: [{
      steps: [
        { mode: 'driving', maneuver: { type: 'depart' } },
        { mode: 'driving', maneuver: { type: 'arrive' } }
      ]
    }]
  }]
};

const airportSenggigiPayload = {
  waypoints: [
    { distance: 0, location: [116.277145, -8.756283] },
    { distance: 0, location: [116.044691, -8.493705] }
  ],
  routes: [{
    distance: 12_100,
    duration: 1_800,
    geometry: {
      type: 'LineString',
      coordinates: [[116.277145, -8.756283], [116.044691, -8.493705]]
    },
    legs: [{
      steps: [
        { mode: 'driving', maneuver: { type: 'depart' } },
        { mode: 'driving', maneuver: { type: 'arrive' } }
      ]
    }]
  }]
};

const ferryPayload = {
  waypoints: airportSenggigiPayload.waypoints,
  routes: [{
    ...airportSenggigiPayload.routes[0],
    legs: [{ steps: [{ mode: 'driving', maneuver: { type: 'ferry' } }] }]
  }]
};

test('geocode uses Mapbox Search Box and keeps only Lombok results', async () => {
  let requestedUrl = '';
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
    getClientAddress: () => '203.0.113.10',
    fetch: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify(geocodePayload), { status: 200 });
    }
  });

  assert.equal(response.status, 200);
  const url = new URL(requestedUrl);
  assert.equal(`${url.origin}${url.pathname}`, 'https://api.mapbox.com/search/searchbox/v1/forward');
  assert.equal(url.searchParams.get('q'), 'Kuta');
  assert.equal(url.searchParams.get('access_token'), 'test-server-token');
  assert.equal(url.searchParams.get('country'), 'id');
  assert.equal(url.searchParams.get('limit'), '8');
  const body = await response.json();
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].lat, -8.893241);
  assert.equal(body.results[0].lng, 116.277504);
  assert.equal(body.results[0].name, 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia');
});

test('geocode preserves the active language for Chinese searches', async () => {
  const requestedUrls = [];
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=zh-cn'),
    getClientAddress: () => '203.0.113.14',
    fetch: async (url) => {
      requestedUrls.push(url);
      return new Response(JSON.stringify({ features: [] }), { status: 200 });
    }
  });
  assert.equal(response.status, 200);
  assert.equal(new URL(requestedUrls[0]).searchParams.get('language'), 'zh-Hans');
  assert.deepEqual((await response.json()).results, []);
});

test('geocode returns a localized outage instead of an empty success', async () => {
  let calls = 0;
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
    getClientAddress: () => '203.0.113.11',
    fetch: async () => {
      calls += 1;
      return new Response('down', { status: 503 });
    }
  });

  assert.equal(response.status, 502);
  assert.equal(calls, 2);
  assert.equal((await response.json()).error, 'The map service cannot be reached. Check your connection and try again.');
});

test('geocode distinguishes provider permission and quota failures', async () => {
  for (const [status, expected] of [
    [403, 'The map service key is not allowed for this site.'],
    [429, 'The map service quota is exhausted. Try again later.']
  ]) {
    const response = await geocode({
      url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
      getClientAddress: () => `203.0.113.${status}`,
      fetch: async () => new Response(JSON.stringify({ error: { message: 'no' } }), { status })
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, expected);
  }
});

test('route retries one transient Mapbox Directions outage', async () => {
  let calls = 0;
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.5&fromLng=116.1&toLat=-8.6&toLng=116.2&lang=en'),
    getClientAddress: () => '203.0.113.12',
    fetch: async () => {
      calls += 1;
      return new Response(
        JSON.stringify(calls === 1 ? { error: { message: 'busy' } } : routePayload),
        { status: calls === 1 ? 503 : 200 }
      );
    }
  });

  assert.equal(response.status, 200);
  assert.equal(calls, 2);
  const body = await response.json();
  assert.equal(body.distanceMeters, 12_100);
  assert.equal(body.distanceKm, 13);
  assert.equal(body.durationMinutes, 30);
  assert.equal(body.roadAccess, true);
  assert.deepEqual(body.points, [[-8.5, 116.1], [-8.6, 116.2]]);
});

test('route sends exactly the pick-up and destination to Mapbox Directions', async () => {
  let requestedUrl = '';
  const request = new Request('http://localhost/api/route', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      lang: 'fr',
      stops: [
        { lat: -8.756283, lng: 116.277145 },
        { lat: -8.493705, lng: 116.044691 }
      ]
    })
  });
  const response = await multiStopRoute({
    request,
    getClientAddress: () => '203.0.113.20',
    fetch: async (url) => {
      requestedUrl = url;
      return new Response(JSON.stringify(airportSenggigiPayload), { status: 200 });
    }
  });

  assert.equal(response.status, 200);
  const url = new URL(requestedUrl);
  assert.equal(url.pathname, '/directions/v5/mapbox/driving/116.277145,-8.756283;116.044691,-8.493705');
  assert.equal(url.searchParams.get('access_token'), 'test-server-token');
  assert.equal(url.searchParams.get('exclude'), 'ferry');
  assert.equal(url.searchParams.get('language'), 'fr');
});

test('route rejects duplicate, outside-Lombok, or excessive points before calling Mapbox', async () => {
  let calls = 0;
  const send = async (stops) => multiStopRoute({
    request: new Request('http://localhost/api/route', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stops, lang: 'en' })
    }),
    getClientAddress: () => '203.0.113.21',
    fetch: async () => { calls += 1; return new Response(JSON.stringify(routePayload), { status: 200 }); }
  });

  const duplicate = await send([
    { lat: -8.756283, lng: 116.277145 },
    { lat: -8.756283, lng: 116.277145 }
  ]);
  assert.equal(duplicate.status, 400);
  assert.match((await duplicate.json()).error, /different/);

  const outside = await send([
    { lat: -8.65, lng: 115.22 },
    { lat: -8.6, lng: 116.2 }
  ]);
  assert.equal(outside.status, 400);
  assert.match((await outside.json()).error, /Lombok/);

  const sea = await send([
    { lat: -8.61646, lng: 115.85837 },
    { lat: -8.43819, lng: 115.976 }
  ]);
  assert.equal(sea.status, 400);
  assert.match((await sea.json()).error, /Lombok/);

  const single = await send([{ lat: -8.5, lng: 116.1 }]);
  assert.equal(single.status, 400);
  assert.match((await single.json()).error, /exactly 2/);

  const excessive = await send(Array.from({ length: 3 }, (_, index) => ({
    lat: -8.5 - index * 0.01,
    lng: 116.1 + index * 0.01
  })));
  assert.equal(excessive.status, 400);
  assert.match((await excessive.json()).error, /exactly 2/);
  assert.equal(calls, 0);
});

test('route rejects a Mapbox route that snaps too far from the requested points', async () => {
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.756283&fromLng=116.277145&toLat=-8.493705&toLng=116.044691&lang=en'),
    getClientAddress: () => '203.0.113.23',
    fetch: async () => new Response(JSON.stringify(routePayload), { status: 200 })
  });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, 'This route has no road access. Choose another point near a road.');
});

test('route rejects a ferry route as lacking road access', async () => {
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.756283&fromLng=116.277145&toLat=-8.493705&toLng=116.044691&lang=en'),
    getClientAddress: () => '203.0.113.24',
    fetch: async () => new Response(JSON.stringify(ferryPayload), { status: 200 })
  });
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, 'This route has no road access. Choose another point near a road.');
});

test('route reports a persistent Mapbox Directions outage as a service error', async () => {
  let calls = 0;
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.5&fromLng=116.1&toLat=-8.6&toLng=116.2&lang=en'),
    getClientAddress: () => '203.0.113.13',
    fetch: async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { message: 'down' } }), { status: 503 });
    }
  });

  assert.equal(response.status, 502);
  assert.equal(calls, 2);
  assert.equal((await response.json()).error, 'The map service cannot be reached. Check your connection and try again.');
});

test('route maps provider quota exhaustion to a retryable message', async () => {
  const response = await route({
    url: new URL('http://localhost/api/route?fromLat=-8.5&fromLng=116.1&toLat=-8.6&toLng=116.2&lang=en'),
    getClientAddress: () => '203.0.113.22',
    fetch: async () => new Response(JSON.stringify({ error: { message: 'quota' } }), { status: 429 })
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'The map service quota is exhausted. Try again later.');
});

const reportedShortRoute = {
  waypoints: [
    { distance: 0, location: [116.10645, -8.58415] },
    { distance: 0, location: [116.10742, -8.58403] }
  ],
  routes: [{
    distance: 150,
    duration: 90,
    geometry: {
      type: 'LineString',
      coordinates: [[116.10645, -8.58415], [116.10742, -8.58403]]
    },
    legs: [{
      steps: [
        { mode: 'driving', maneuver: { type: 'depart' } },
        { mode: 'driving', maneuver: { type: 'arrive' } }
      ]
    }]
  }]
};

test('route rejects the reported 150 m route with a localized message in every locale', async () => {
  const locales = ['id', 'en', 'zh-cn', 'zh-tw', 'nl', 'fr', 'de', 'ms'];
  const messages = [];
  for (const [index, lang] of locales.entries()) {
    const response = await route({
      url: new URL(`http://localhost/api/route?fromLat=-8.58415&fromLng=116.10645&toLat=-8.58403&toLng=116.10742&lang=${lang}`),
      getClientAddress: () => `203.0.113.${40 + index}`,
      fetch: async () => new Response(JSON.stringify(reportedShortRoute), { status: 200 })
    });
    assert.equal(response.status, 422, lang);
    const body = await response.json();
    assert.equal(body.code, 'route_too_short', lang);
    assert.equal(body.error, getFormCopy(lang).routeTooShort.replace('{distance}', '1 km'), lang);
    messages.push(body.error);
  }
  assert.equal(new Set(messages).size, locales.length);
});
