import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as geocode } from '../src/routes/api/geocode/+server.js';
import { GET as route, POST as multiStopRoute } from '../src/routes/api/route/+server.js';

process.env.GOOGLE_MAPS_SERVER_API_KEY = 'test-server-key';

const geocodePayload = {
  places: [
    {
      id: 'place-kuta',
      displayName: { text: 'Kuta' },
      formattedAddress: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia',
      location: { latitude: -8.893241, longitude: 116.277504 }
    },
    {
      id: 'place-bali',
      displayName: { text: 'Denpasar' },
      formattedAddress: 'Denpasar, Bali, Indonesia',
      location: { latitude: -8.65, longitude: 115.22 }
    }
  ]
};

const routePayload = {
  routes: [{
    distanceMeters: 12_100,
    duration: '1800s',
    polyline: { encodedPolyline: '~c{r@_xrcU~oR_pR' },
    legs: [{
      startLocation: { latLng: { latitude: -8.5, longitude: 116.1 } },
      endLocation: { latLng: { latitude: -8.6, longitude: 116.2 } },
      steps: [
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DEPART' } },
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DESTINATION' } }
      ]
    }]
  }]
};

const airportSenggigiPayload = {
  routes: [{
    distanceMeters: 12_100,
    duration: '1800s',
    polyline: { encodedPolyline: 'vemt@ekudUchr@zkl@' },
    legs: [{
      startLocation: { latLng: { latitude: -8.756283, longitude: 116.277145 } },
      endLocation: { latLng: { latitude: -8.493705, longitude: 116.044691 } },
      steps: [
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DEPART' } },
        { travelMode: 'DRIVE', navigationInstruction: { maneuver: 'DESTINATION' } }
      ]
    }]
  }]
};

const ferryPayload = {
  routes: [{
    distanceMeters: 12_100,
    duration: '1800s',
    polyline: { encodedPolyline: 'vemt@ekudUchr@zkl@' },
    legs: [{
      startLocation: { latLng: { latitude: -8.756283, longitude: 116.277145 } },
      endLocation: { latLng: { latitude: -8.493705, longitude: 116.044691 } },
      steps: [{ travelMode: 'DRIVE', navigationInstruction: { maneuver: 'FERRY' } }]
    }]
  }]
};

test('geocode uses Google Places and keeps only Lombok results', async () => {
  let requestedUrl = '';
  let requestedOptions;
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
    getClientAddress: () => '203.0.113.10',
    fetch: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return new Response(JSON.stringify(geocodePayload), { status: 200 });
    }
  });

  assert.equal(response.status, 200);
  assert.equal(requestedUrl, 'https://places.googleapis.com/v1/places:searchText');
  assert.equal(requestedOptions.headers['x-goog-api-key'], 'test-server-key');
  assert.match(requestedOptions.headers['x-goog-fieldmask'], /places\.displayName/);
  const body = await response.json();
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].lat, -8.893241);
  assert.equal(body.results[0].lng, 116.277504);
  assert.equal(body.results[0].name, 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia');
  const sent = JSON.parse(requestedOptions.body);
  assert.equal(sent.languageCode, 'en');
  assert.equal(sent.regionCode, 'ID');
  assert.equal(sent.locationRestriction.rectangle.low.latitude, -9.15);
});

test('geocode preserves the active language for Chinese searches', async () => {
  let sent;
  const response = await geocode({
    url: new URL('http://localhost/api/geocode?q=Kuta&lang=zh-cn'),
    getClientAddress: () => '203.0.113.14',
    fetch: async (url, options) => {
      sent = JSON.parse(options.body);
      return new Response(JSON.stringify({ places: [] }), { status: 200 });
    }
  });
  assert.equal(response.status, 200);
  assert.equal(sent.languageCode, 'zh-CN');
  assert.deepEqual((await response.json()).results, []);
});

test('geocode switches to Mapbox when MAP_PROVIDER is mapbox', async () => {
  const previousProvider = process.env.MAP_PROVIDER;
  const previousToken = process.env.MAPBOX_SERVER_TOKEN;
  process.env.MAP_PROVIDER = 'mapbox';
  process.env.MAPBOX_SERVER_TOKEN = 'test-mapbox-token';
  try {
    let requestedUrl = '';
    const response = await geocode({
      url: new URL('http://localhost/api/geocode?q=Kuta&lang=en'),
      getClientAddress: () => '203.0.113.15',
      fetch: async (url) => {
        requestedUrl = url;
        return new Response(JSON.stringify({
          features: [{
            id: 'mb1',
            text: 'Kuta',
            place_name: 'Kuta, Central Lombok Regency, West Nusa Tenggara, Indonesia',
            center: [116.277504, -8.893241]
          }]
        }), { status: 200 });
      }
    });

    assert.equal(response.status, 200);
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, '/geocoding/v5/mapbox.places/Kuta.json');
    assert.equal(url.searchParams.get('access_token'), 'test-mapbox-token');
    const body = await response.json();
    assert.equal(body.results.length, 1);
    assert.equal(body.results[0].placeId, 'mb1');
  } finally {
    if (previousProvider === undefined) delete process.env.MAP_PROVIDER;
    else process.env.MAP_PROVIDER = previousProvider;
    if (previousToken === undefined) delete process.env.MAPBOX_SERVER_TOKEN;
    else process.env.MAPBOX_SERVER_TOKEN = previousToken;
  }
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

test('route retries one transient Google Routes outage', async () => {
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
  assert.equal(body.distanceKm, 13);
  assert.equal(body.durationMinutes, 30);
  assert.equal(body.roadAccess, true);
  assert.deepEqual(body.points, [[-8.5, 116.1], [-8.6, 116.2]]);
});

test('route posts exactly the pick-up and destination to Google Routes', async () => {
  let sent;
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
    fetch: async (url, options) => {
      sent = JSON.parse(options.body);
      return new Response(JSON.stringify(airportSenggigiPayload), { status: 200 });
    }
  });

  assert.equal(response.status, 200);
  assert.equal(sent.languageCode, 'fr');
  assert.equal(sent.routeModifiers.avoidFerries, true);
  assert.equal('intermediates' in sent, false);
  assert.deepEqual(sent.origin.location.latLng, { latitude: -8.756283, longitude: 116.277145 });
  assert.deepEqual(sent.destination.location.latLng, { latitude: -8.493705, longitude: 116.044691 });
});

test('route rejects duplicate, outside-Lombok, or excessive points before calling Google', async () => {
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

test('route rejects a Google route that snaps too far from the requested points', async () => {
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

test('route reports a persistent Google Routes outage as a service error', async () => {
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
