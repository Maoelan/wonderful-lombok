<script>
  import 'leaflet/dist/leaflet.css';
  import { onDestroy, onMount } from 'svelte';
  import { calculatePickupPrice, hasStableGpsFix, isInsideLombok, isUsableGpsFix, localizedPlaces, readRoadRoute } from './pickup.js';
  import { createWhatsAppUrl } from './whatsapp.js';
  import { createIdempotencyKey } from './idempotency.js';
  import { todayInWita } from './date.js';
  import { getFormCopy, localeTag } from './i18n.js';

  let mapElement, map, routeLayer, gpsPreviewLayer, leaflet;
  let mapLoading = true, mapError = '', routeLoading = false, routeError = '';
  let routeNotice = '';
  let distance = 0, routeRequest = 0;
  let origin = null, destination = null, originQuery = '', destinationQuery = '';
  let mapTarget = 'origin', locationMessage = '', searchLoading = '', searchTarget = '', searchResults = [];
  let searchTimer = null, searchController = null;
  let gpsLoading = false, gpsWatch = null, gpsTimer = null, bestGpsFix = null, gpsFixes = [];
  let customerName = '', phone = '', pickupDate = '', pickupTime = '', passengers = 1;
  let formError = '', submitted = false, submitting = false, idempotencyKey = '', lastBookingFingerprint = '', website = '';

  export let rate = 10_000;
  export let whatsapp = '6281916550731';
  export let locale = 'id';
  $: t = getFormCopy(locale);
  $: availablePlaces = localizedPlaces(locale);
  const today = todayInWita();
  $: rupiah = new Intl.NumberFormat(localeTag(locale), { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  $: price = calculatePickupPrice(distance, rate);
  $: routeReady = Boolean(origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng));
  $: if (map) drawRoute(origin, destination);

  const message = (template, values = {}) => Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

  onMount(async () => {
    try {
      const L = leaflet = await import('leaflet');
      map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: false }).setView([-8.65, 116.17], 9);
      L.control.zoom({ zoomInTitle: t.zoomIn, zoomOutTitle: t.zoomOut }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      routeLayer = L.layerGroup().addTo(map);
      gpsPreviewLayer = L.layerGroup().addTo(map);
      map.on('click', ({ latlng }) => {
        gpsPreviewLayer.clearLayers();
        setLocation(mapTarget, { name: message(t.mapPoint, { lat: latlng.lat.toFixed(5), lng: latlng.lng.toFixed(5) }), lat: latlng.lat, lng: latlng.lng, source: 'map' });
      });
      mapLoading = false;
    } catch { mapLoading = false; mapError = t.mapLoadError; }
  });

  onDestroy(() => { stopGps(); clearTimeout(searchTimer); searchController?.abort(); });

  function setLocation(target, place) {
    gpsPreviewLayer?.clearLayers();
    if (target === 'origin') { origin = place; originQuery = place.name; }
    else { destination = place; destinationQuery = place.name; }
    searchTarget = '';
    searchResults = [];
    locationMessage = message(t.selected, { field: target === 'origin' ? t.pickup : t.destination, place: place.name });
  }

  function activateMapTarget(target) {
    mapTarget = target;
    locationMessage = message(t.chooseOnMap, { field: target === 'origin' ? t.pickup.toLowerCase() : t.destination.toLowerCase() });
  }

  function choosePreset(target, id) {
    const place = availablePlaces.find((item) => item.id === id);
    if (place) setLocation(target, place);
  }

  function queuePlaceSearch(target) {
    clearTimeout(searchTimer);
    const query = (target === 'origin' ? originQuery : destinationQuery).trim();
    searchTarget = target;
    if (query.length < 3) { searchResults = []; return; }
    searchTimer = setTimeout(() => searchPlaces(target), 500);
  }

  async function searchPlaces(target, chooseFirst = false) {
    const query = (target === 'origin' ? originQuery : destinationQuery).trim();
    if (query.length < 3) { locationMessage = t.minimumCharacters; return; }
    searchController?.abort();
    searchController = new AbortController();
    searchLoading = target;
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(locale)}`, { signal: searchController.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.searchFailed);
      searchTarget = target;
      searchResults = result.results || [];
      if (!searchResults.length) { locationMessage = t.noPlaces; return; }
      locationMessage = message(t.placesFound, { count: searchResults.length });
      if (chooseFirst) {
        const [place] = searchResults;
        setLocation(target, place);
        map?.setView([place.lat, place.lng], 14);
      }
    } catch (error) {
      if (error.name !== 'AbortError') locationMessage = error.message || t.searchFailed;
    } finally {
      if (searchLoading === target) searchLoading = '';
    }
  }

  function chooseSearchResult(target, place) {
    setLocation(target, place);
    map?.setView([place.lat, place.lng], 14);
  }

  function handleSearchKey(event, target) {
    if (event.key === 'Enter') { event.preventDefault(); searchPlaces(target, true); }
    if (event.key === 'Escape') { searchTarget = ''; searchResults = []; }
  }

  function stopGps() {
    if (gpsWatch !== null && typeof navigator !== 'undefined') navigator.geolocation?.clearWatch(gpsWatch);
    if (gpsTimer) clearTimeout(gpsTimer);
    gpsWatch = null; gpsTimer = null; gpsLoading = false;
  }

  function showGpsPreview(fix) {
    if (!gpsPreviewLayer || !leaflet || !fix) return;
    gpsPreviewLayer.clearLayers();
    leaflet.circle([fix.lat, fix.lng], { radius: fix.accuracy, color: '#08778c', fillColor: '#20a9bc', fillOpacity: .13, weight: 2 }).addTo(gpsPreviewLayer);
    leaflet.circleMarker([fix.lat, fix.lng], { radius: 6, color: '#fff', fillColor: '#08778c', fillOpacity: 1, weight: 3 }).addTo(gpsPreviewLayer);
    map?.setView([fix.lat, fix.lng], fix.accuracy <= 30 ? 18 : 16);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { locationMessage = t.gpsUnsupported; return; }
    stopGps();
    gpsPreviewLayer?.clearLayers();
    gpsLoading = true;
    bestGpsFix = null;
    gpsFixes = [];
    locationMessage = t.gpsSearching;
    const finish = () => {
      if (!bestGpsFix) { stopGps(); locationMessage = t.gpsUnavailable; return; }
      const { lat, lng, accuracy } = bestGpsFix;
      stopGps();
      if (!isInsideLombok(lat, lng)) { locationMessage = t.gpsOutside; return; }
      if (accuracy > 50) {
        showGpsPreview(bestGpsFix);
        locationMessage = message(t.gpsInsufficient, { accuracy: Math.round(accuracy) });
        return;
      }
      setLocation('origin', { name: message(t.currentLocation, { accuracy: Math.round(accuracy) }), lat, lng, accuracy: Math.round(accuracy), source: 'gps' });
      locationMessage = accuracy <= 20
        ? message(t.gpsLockedHigh, { accuracy: Math.round(accuracy) })
        : message(t.gpsLocked, { accuracy: Math.round(accuracy) });
      map?.setView([lat, lng], accuracy <= 100 ? 17 : 15);
    };
    gpsWatch = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const fix = { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, timestamp };
        if (!isInsideLombok(fix.lat, fix.lng)) {
          locationMessage = t.gpsOutside;
          return;
        }
        if (!isUsableGpsFix(fix, { maxAccuracy: 500 })) return;
        gpsFixes = [...gpsFixes.slice(-5), fix];
        if (!bestGpsFix || fix.accuracy < bestGpsFix.accuracy) bestGpsFix = fix;
        showGpsPreview(bestGpsFix);
        locationMessage = message(t.gpsLocking, { accuracy: Math.round(bestGpsFix.accuracy) });
        if (bestGpsFix.accuracy <= 20 && hasStableGpsFix(gpsFixes)) finish();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) { stopGps(); locationMessage = t.gpsDenied; }
        else if (error.code === error.POSITION_UNAVAILABLE) locationMessage = t.gpsSignalUnavailable;
      },
      { enableHighAccuracy: true, timeout: 25_000, maximumAge: 0 }
    );
    gpsTimer = setTimeout(finish, 25_000);
  }

  async function drawRoute(from, to) {
    if (!routeLayer || !map) return;
    const requestId = ++routeRequest;
    const L = await import('leaflet');
    routeLayer.clearLayers(); distance = 0; routeError = ''; routeNotice = '';
    if (from?.accuracy) L.circle([from.lat, from.lng], { radius: from.accuracy, color: '#08778c', fillColor: '#20a9bc', fillOpacity: .1, weight: 1.5 }).addTo(routeLayer);
    if (from) L.circleMarker([from.lat, from.lng], { radius: 7, color: '#123f35', fillColor: '#f2b84b', fillOpacity: 1, weight: 3 }).bindTooltip(`${t.pickupMarker}: ${from.name}`).addTo(routeLayer);
    if (to) L.circleMarker([to.lat, to.lng], { radius: 7, color: '#123f35', fillColor: '#fffaf0', fillOpacity: 1, weight: 3 }).bindTooltip(`${t.destinationMarker}: ${to.name}`).addTo(routeLayer);
    if (!routeReady) { routeLoading = false; return; }
    routeLoading = true;
    try {
      const params = new URLSearchParams({ fromLat: from.lat, fromLng: from.lng, toLat: to.lat, toLng: to.lng, lang: locale });
      if (from.accuracy) params.set('fromAccuracy', from.accuracy);
      const response = await fetch(`/api/route?${params}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t.routeUnavailable);
      const roadRoute = readRoadRoute(payload, t.routeNotFound);
      if (requestId !== routeRequest) return;
      distance = roadRoute.distanceKm;
      if (roadRoute.snapDistanceM > 80) routeNotice = message(t.routeSnapNotice, { distance: Math.round(roadRoute.snapDistanceM) });
      L.polyline(roadRoute.points, { color: '#123f35', weight: 4 }).addTo(routeLayer);
      map.fitBounds(roadRoute.points, { padding: [48, 48] });
    } catch (error) { if (requestId === routeRequest) routeError = error.message || t.roadRouteUnavailable; }
    finally { if (requestId === routeRequest) routeLoading = false; }
  }

  function swapLocations() {
    [origin, destination] = [destination, origin];
    [originQuery, destinationQuery] = [destinationQuery, originQuery];
  }

  async function submitRequest() {
    formError = ''; submitted = false;
    if (!routeReady) { formError = t.chooseDifferent; return; }
    if (routeLoading || routeError || !distance) { formError = t.waitForRoute; return; }
    if (!customerName.trim() || !phone.trim() || !pickupDate || !pickupTime) { formError = t.completeBooking; return; }
    submitting = true;
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const fingerprint = JSON.stringify({ customerName: customerName.trim(), phone: phone.trim(), pickupDate, pickupTime, passengers: Number(passengers), origin, destination, distance, price });
      if (fingerprint !== lastBookingFingerprint) { lastBookingFingerprint = fingerprint; idempotencyKey = createIdempotencyKey(); }
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify({ name: customerName, whatsapp: phone, travelDate: pickupDate, people: Number(passengers), serviceType: 'travel', serviceName: t.bookingService, website, details: { origin: origin.name, destination: destination.name, originCoordinates: [origin.lat, origin.lng], originAccuracyM: origin.accuracy || null, originSource: origin.source || 'search', destinationCoordinates: [destination.lat, destination.lng], pickupTime, distanceKm: distance, estimatedPrice: price, locale } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      submitted = true;
      website = '';
      const whatsappMessage = [t.whatsappGreeting, `${t.codeLabel}: ${result.code}`, '', `${t.nameLabel}: ${customerName.trim()}`, `${t.whatsapp}: ${phone.trim()}`, `${t.from}: ${origin.name}`, ...(origin.accuracy ? [`${t.accuracyLabel}: ±${origin.accuracy} m`] : []), `${t.to}: ${destination.name}`, `${t.date}: ${pickupDate}`, `${t.time}: ${pickupTime} WITA`, `${t.passengers}: ${message(t.peopleValue, { count: passengers })}`, `${t.distanceLabel}: ${distance} km`, `${t.costLabel}: ${rupiah.format(price)}`].join('\n');
      if (whatsappWindow) whatsappWindow.location.href = createWhatsAppUrl(whatsappMessage, whatsapp);
      else window.location.href = createWhatsAppUrl(whatsappMessage, whatsapp);
    } catch (error) { whatsappWindow?.close(); formError = error.message || t.bookingSaveFailed; }
    finally { submitting = false; }
  }
</script>

<div class="pickup-shell">
  <div class="pickup-fields">
    <div class="location-tools">
      <div class="location-field">
        <div class="location-search"><label><span>{t.pickup}</span><input bind:value={originQuery} autocomplete="off" placeholder={searchLoading === 'origin' ? t.searching : t.address} on:focus={() => { activateMapTarget('origin'); queuePlaceSearch('origin'); }} on:input={() => queuePlaceSearch('origin')} on:keydown={(event) => handleSearchKey(event, 'origin')} /></label>{#if searchTarget === 'origin' && searchResults.length}<div class="place-suggestions" role="listbox" aria-label={t.searchResultsPickup}>{#each searchResults as place}<button type="button" role="option" aria-selected="false" on:click={() => chooseSearchResult('origin', place)}>{place.name}</button>{/each}</div>{/if}</div>
        <select aria-label={t.pickup} on:change={(event) => choosePreset('origin', event.currentTarget.value)}><option value="">{t.popular}</option>{#each availablePlaces as place}<option value={place.id}>{place.name}</option>{/each}</select>
        <button class="gps-action" type="button" on:click={useCurrentLocation} disabled={gpsLoading}>{gpsLoading ? t.locating : t.useLocation}</button>
      </div>
      <button class="swap" type="button" on:click={swapLocations} disabled={!origin && !destination} aria-label={t.swapLocations}>⇅</button>
      <div class="location-field">
        <div class="location-search"><label><span>{t.destination}</span><input bind:value={destinationQuery} autocomplete="off" placeholder={searchLoading === 'destination' ? t.searching : t.address} on:focus={() => { activateMapTarget('destination'); queuePlaceSearch('destination'); }} on:input={() => queuePlaceSearch('destination')} on:keydown={(event) => handleSearchKey(event, 'destination')} /></label>{#if searchTarget === 'destination' && searchResults.length}<div class="place-suggestions" role="listbox" aria-label={t.searchResultsDestination}>{#each searchResults as place}<button type="button" role="option" aria-selected="false" on:click={() => chooseSearchResult('destination', place)}>{place.name}</button>{/each}</div>{/if}</div>
        <select aria-label={t.destination} on:change={(event) => choosePreset('destination', event.currentTarget.value)}><option value="">{t.popular}</option>{#each availablePlaces as place}<option value={place.id}>{place.name}</option>{/each}</select>
      </div>
    </div>
    <p class="helper location-guidance" aria-live="polite">{locationMessage || t.guidance}</p>
    {#if routeNotice}<p class="helper route-notice" role="status">{routeNotice}</p>{/if}
    <div class="map-wrap" class:has-route={routeReady}>
      <div class="map" bind:this={mapElement} aria-label={t.interactiveMap}></div>
      {#if mapLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.loadingMap}</div>{:else if mapError}<div class="map-state error" role="alert">{mapError}</div>{:else if routeLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.findingRoute}</div>{:else if routeError}<div class="map-state error" role="alert">{routeError}</div>{/if}
    </div>
  </div>

  <form class="quote" on:submit|preventDefault={submitRequest} novalidate>
    <div class="honeypot" aria-hidden="true"><label><span>Website</span><input bind:value={website} name="website" tabindex="-1" autocomplete="off" /></label></div>
    <div class="quote-heading"><p>{t.estimate}</p>{#key price}<strong class:calculating={routeLoading}>{routeLoading ? t.calculating : rupiah.format(price)}</strong>{/key}<span>{distance ? `${distance} km × ${rupiah.format(rate)}` : `${t.rate}: ${rupiah.format(rate)}`}</span></div>
    <div class="route-summary" aria-live="polite"><div><span>{t.from}</span><b>{origin?.name ?? t.notSelected}</b></div><div><span>{t.to}</span><b>{destination?.name ?? t.notSelected}</b></div></div>
    <label><span>{t.customer}</span><input bind:value={customerName} autocomplete="name" placeholder={t.fullName} /></label>
    <label><span>{t.whatsapp}</span><input bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="0812 3456 7890" /></label>
    <div class="form-row"><label><span>{t.date}</span><input bind:value={pickupDate} type="date" min={today} /></label><label><span>{t.time}</span><input bind:value={pickupTime} type="time" /></label></div>
    <label><span>{t.passengers}</span><input bind:value={passengers} type="number" min="1" max="12" /></label>
    {#if formError}<p class="form-message error" role="alert">{formError}</p>{/if}{#if submitted}<p class="form-message success" role="status">{t.bookingOpened}</p>{/if}
    <button class="submit" type="submit" disabled={submitting}>{submitting ? t.saving : t.bookTravel}</button>
    <small>{t.estimateNote}</small>
  </form>
</div>
