<script>
  import { onDestroy, onMount } from 'svelte';
  import { calculatePickupPrice, estimateLabel, hasStableGpsFix, isInsideLombok, isUsableGpsFix, localizedPlaces } from './pickup.js';
  import { createMap } from './maps/index.js';
  import { createWhatsAppUrl } from './whatsapp.js';
  import { createIdempotencyKey } from './idempotency.js';
  import { todayInWita } from './date.js';
  import { getFormCopy, localeTag } from './i18n.js';

  let mapElement;
  let map = null;
  let mapLoading = true, mapError = '', routeLoading = false, routeError = '', routeNotice = '';
  let distance = 0, routeDuration = null, routePoints = [];
  let origin = null, destination = null, originQuery = '', destinationQuery = '';
  let mapTarget = 'origin';
  let locationMessage = '', searchLoading = '', searchTarget = '', searchResults = [];
  let searchTimer = null, searchController = null, searchRequestId = 0, searchActiveIndex = -1, searchCloseTimer = null;
  let gpsLoading = false, gpsWatch = null, gpsTimer = null, bestGpsFix = null, gpsFixes = [];
  let customerName = '', phone = '', pickupDate = '', pickupTime = '', passengers = 1;
  let formError = '', submitted = false, submitting = false, idempotencyKey = '', lastBookingFingerprint = '', website = '';
  let currentRouteKey = '', routeController = null, destroyed = false;

  export let rate = 10_000;
  export let whatsapp = '6281916550731';
  export let locale = 'id';
  export let googleMapsKey = '';
  export let mapProvider = 'google';
  export let mapboxToken = '';
  $: t = getFormCopy(locale);
  $: availablePlaces = localizedPlaces(locale);
  const today = todayInWita();
  $: rupiah = new Intl.NumberFormat(localeTag(locale), { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  $: price = calculatePickupPrice(distance, rate);
  $: routeReady = Boolean(origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng));
  $: routeKey = [origin, destination].map((point) => point ? `${point.lat.toFixed(5)},${point.lng.toFixed(5)}` : '').join('|');
  $: estimateText = estimateLabel({
    loading: routeLoading,
    error: routeError,
    ready: routeReady,
    price,
    format: (value) => rupiah.format(value),
    calculating: t.calculating
  });
  $: if (map) renderMarkers(origin, destination);
  $: if (map) updateRoute(routeKey);

  const message = (template, values = {}) => Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
  const fieldLabel = (target) => target === 'origin' ? t.pickup : t.destination;
  const currentQuery = (target) => (target === 'origin' ? originQuery : destinationQuery).trim();

  function authFailure() {
    mapError = t.mapPermissionDenied;
    mapLoading = false;
  }

  function mapErrorFor(error) {
    const code = error?.code || error?.message;
    if (code === 'not_configured') return t.mapNotConfigured;
    if (code === 'permission_denied') return t.mapPermissionDenied;
    return t.mapNetworkError;
  }

  onMount(async () => {
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    try {
      const adapter = await createMap({
        element: mapElement,
        provider: mapProvider,
        apiKey: googleMapsKey,
        token: mapboxToken,
        locale,
        onPick: (point) => setLocation(mapTarget, {
          name: message(t.mapPoint, { lat: point.lat.toFixed(5), lng: point.lng.toFixed(5) }),
          lat: point.lat,
          lng: point.lng,
          source: 'map'
        }),
        onAuthFailure: authFailure
      });
      if (destroyed) {
        adapter.destroy();
        return;
      }
      map = adapter;
      mapLoading = false;
      currentRouteKey = '';
      updateRoute(routeKey);
    } catch (error) {
      mapLoading = false;
      mapError = mapErrorFor(error);
    }
  });

  onDestroy(() => {
    destroyed = true;
    if (typeof document !== 'undefined') document.removeEventListener('pointerdown', handleDocumentPointerDown);
    clearTimeout(searchCloseTimer);
    searchRequestId += 1;
    stopGps();
    clearTimeout(searchTimer);
    searchController?.abort();
    routeController?.abort();
    map?.destroy();
    map = null;
  });

  function clearGpsPreview() {
    map?.clearGpsPreview();
  }

  function showGpsPreview(fix) {
    if (!map || !fix) return;
    map.showGpsPreview(fix, message(t.currentLocation, { accuracy: Math.round(fix.accuracy) }));
    map.panTo(fix.lat, fix.lng);
    map.setZoom(fix.accuracy <= 30 ? 18 : 16);
  }

  function closeSearchResults({ cancel = false } = {}) {
    clearTimeout(searchCloseTimer);
    searchTarget = '';
    searchResults = [];
    searchActiveIndex = -1;
    if (cancel) {
      searchRequestId += 1;
      searchController?.abort();
      searchController = null;
      searchLoading = '';
      locationMessage = '';
    }
  }

  function handleDocumentPointerDown(event) {
    if (!searchTarget) return;
    if (event.target instanceof Element && event.target.closest('.location-search')) return;
    closeSearchResults({ cancel: true });
  }

  function handleSearchFocusOut() {
    clearTimeout(searchCloseTimer);
    searchCloseTimer = setTimeout(() => {
      if (!searchTarget) return;
      if (document.activeElement instanceof Element && document.activeElement.closest('.location-search')) return;
      closeSearchResults({ cancel: true });
    }, 0);
  }

  function setLocation(target, place) {
    if (!isInsideLombok(place.lat, place.lng)) {
      locationMessage = t.routeOutsideLombok;
      return false;
    }
    const other = target === 'origin' ? destination : origin;
    if (other && Math.abs(other.lat - place.lat) < 1e-6 && Math.abs(other.lng - place.lng) < 1e-6) {
      locationMessage = t.routeDuplicateStop;
      return false;
    }
    clearTimeout(searchTimer);
    clearGpsPreview();
    closeSearchResults({ cancel: true });
    mapTarget = target;
    if (target === 'origin') {
      origin = place;
      originQuery = place.name;
    } else {
      destination = place;
      destinationQuery = place.name;
    }
    locationMessage = message(t.selected, { field: fieldLabel(target), place: place.name });
    return true;
  }

  function activateMapTarget(target, scroll = false) {
    mapTarget = target;
    if (searchTarget && searchTarget !== target) closeSearchResults({ cancel: true });
    locationMessage = message(t.chooseOnMap, { field: fieldLabel(target).toLowerCase() });
    if (scroll) mapElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function choosePreset(event, target) {
    const id = event.currentTarget.value;
    event.currentTarget.value = '';
    const place = availablePlaces.find((item) => item.id === id);
    if (!place) return;
    if (setLocation(target, { ...place, source: 'preset' })) {
      map?.panTo(place.lat, place.lng);
      map?.setZoom(14);
    }
  }

  function queuePlaceSearch(target) {
    clearTimeout(searchTimer);
    searchTarget = target;
    searchResults = [];
    searchActiveIndex = -1;
    const value = currentQuery(target);
    if (value.length < 3) {
      closeSearchResults({ cancel: true });
      return;
    }
    locationMessage = '';
    searchTimer = setTimeout(() => searchPlaces(target, value), 500);
  }

  async function searchPlaces(target, value = currentQuery(target)) {
    if (value.length < 3) {
      locationMessage = t.minimumCharacters;
      return;
    }
    const requestId = ++searchRequestId;
    searchController?.abort();
    const controller = new AbortController();
    searchController = controller;
    searchLoading = target;
    searchTarget = target;
    searchResults = [];
    searchActiveIndex = -1;
    locationMessage = t.searching;
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}&lang=${encodeURIComponent(locale)}`, { signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.searchFailed);
      if (requestId !== searchRequestId || searchTarget !== target || currentQuery(target) !== value) return;
      searchResults = result.results || [];
      locationMessage = searchResults.length ? message(t.placesFound, { count: searchResults.length }) : t.noPlaces;
    } catch (error) {
      if (error.name !== 'AbortError' && requestId === searchRequestId) locationMessage = error.message || t.searchFailed;
    } finally {
      if (requestId === searchRequestId) {
        searchLoading = '';
        if (searchController === controller) searchController = null;
      }
    }
  }

  function chooseSearchResult(target, place) {
    if (!setLocation(target, place)) return;
    map?.panTo(place.lat, place.lng);
    map?.setZoom(14);
  }

  function handleSearchKey(event, target) {
    const open = searchTarget === target && searchResults.length > 0;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open) return;
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      searchActiveIndex = searchActiveIndex < 0
        ? (step > 0 ? 0 : searchResults.length - 1)
        : (searchActiveIndex + step + searchResults.length) % searchResults.length;
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && searchActiveIndex >= 0) {
        chooseSearchResult(target, searchResults[searchActiveIndex]);
        return;
      }
      clearTimeout(searchTimer);
      searchPlaces(target, currentQuery(target));
      return;
    }
    if (event.key === 'Escape') {
      closeSearchResults({ cancel: true });
    }
  }

  function swapLocations() {
    closeSearchResults({ cancel: true });
    [origin, destination] = [destination, origin];
    [originQuery, destinationQuery] = [destinationQuery, originQuery];
    locationMessage = '';
  }

  function stopGps() {
    if (gpsWatch !== null && typeof navigator !== 'undefined') navigator.geolocation?.clearWatch(gpsWatch);
    if (gpsTimer) clearTimeout(gpsTimer);
    gpsWatch = null;
    gpsTimer = null;
    gpsLoading = false;
  }

  function cancelGps() {
    stopGps();
    clearGpsPreview();
    locationMessage = '';
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      locationMessage = t.gpsUnsupported;
      return;
    }
    stopGps();
    clearGpsPreview();
    gpsLoading = true;
    bestGpsFix = null;
    gpsFixes = [];
    locationMessage = t.gpsSearching;
    const finish = () => {
      if (!bestGpsFix) {
        stopGps();
        locationMessage = t.gpsUnavailable;
        return;
      }
      const { lat, lng, accuracy } = bestGpsFix;
      stopGps();
      if (!isInsideLombok(lat, lng)) {
        locationMessage = t.gpsOutside;
        return;
      }
      if (accuracy > 50) {
        showGpsPreview(bestGpsFix);
        locationMessage = message(t.gpsInsufficient, { accuracy: Math.round(accuracy) });
        return;
      }
      const applied = setLocation('origin', {
        name: message(t.currentLocation, { accuracy: Math.round(accuracy) }),
        lat,
        lng,
        accuracy: Math.round(accuracy),
        source: 'gps'
      });
      if (!applied) return;
      locationMessage = accuracy <= 20
        ? message(t.gpsLockedHigh, { accuracy: Math.round(accuracy) })
        : message(t.gpsLocked, { accuracy: Math.round(accuracy) });
      map?.panTo(lat, lng);
      map?.setZoom(accuracy <= 100 ? 17 : 15);
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
        if (error.code === error.PERMISSION_DENIED) {
          stopGps();
          locationMessage = t.gpsDenied;
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          locationMessage = t.gpsSignalUnavailable;
        }
      },
      { enableHighAccuracy: true, timeout: 25_000, maximumAge: 0 }
    );
    gpsTimer = setTimeout(finish, 25_000);
  }

  function renderMarkers(originPoint, destinationPoint) {
    map?.setMarkers(originPoint, destinationPoint, {
      pickup: t.pickupMarker,
      destination: t.destinationMarker
    });
  }

  function fitRoute() {
    if (!map || !routePoints.length) return;
    map.fitRoute(routePoints);
  }

  async function updateRoute(key) {
    if (!map) return;
    if (key === currentRouteKey) return;
    currentRouteKey = key;
    routeController?.abort();
    routeController = null;
    map.clearRoute();
    routePoints = [];
    distance = 0;
    routeDuration = null;
    routeError = '';
    routeNotice = '';
    formError = '';
    if (!routeReady) {
      routeLoading = false;
      return;
    }
    routeLoading = true;
    routeController = new AbortController();
    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: routeController.signal,
        body: JSON.stringify({
          stops: [
            { lat: origin.lat, lng: origin.lng },
            { lat: destination.lat, lng: destination.lng }
          ],
          lang: locale
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t.routeUnavailable);
      if (key !== currentRouteKey || !map) return;
      distance = payload.distanceKm;
      routeDuration = payload.durationMinutes;
      routePoints = payload.points || [];
      if (payload.snapDistanceM > 80) routeNotice = message(t.routeSnapNotice, { distance: Math.round(payload.snapDistanceM) });
      if (routePoints.length) {
        map.setRoute(routePoints);
        fitRoute();
      }
    } catch (error) {
      if (key === currentRouteKey && error.name !== 'AbortError') routeError = error.message || t.roadRouteUnavailable;
    } finally {
      if (key === currentRouteKey) routeLoading = false;
    }
  }

  function zoomIn() {
    if (map) map.setZoom(map.getZoom() + 1);
  }

  function zoomOut() {
    if (map) map.setZoom(map.getZoom() - 1);
  }

  async function submitRequest() {
    formError = '';
    submitted = false;
    if (!origin || !destination) { formError = t.chooseBothPoints; return; }
    if (!routeReady) { formError = t.chooseDifferent; return; }
    if (routeLoading || routeError || !distance) { formError = t.waitForRoute; return; }
    if (!customerName.trim() || !phone.trim() || !pickupDate || !pickupTime) { formError = t.completeBooking; return; }
    submitting = true;
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const fingerprint = JSON.stringify({
        customerName: customerName.trim(),
        phone: phone.trim(),
        pickupDate,
        pickupTime,
        passengers: Number(passengers),
        origin,
        destination,
        distance,
        price
      });
      if (fingerprint !== lastBookingFingerprint) {
        lastBookingFingerprint = fingerprint;
        idempotencyKey = createIdempotencyKey();
      }
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
        body: JSON.stringify({
          name: customerName,
          whatsapp: phone,
          travelDate: pickupDate,
          people: Number(passengers),
          serviceType: 'travel',
          serviceName: t.bookingService,
          website,
          details: {
            origin: origin.name,
            destination: destination.name,
            originCoordinates: [origin.lat, origin.lng],
            originAccuracyM: origin.accuracy || null,
            originSource: origin.source || 'search',
            destinationCoordinates: [destination.lat, destination.lng],
            pickupTime,
            distanceKm: distance,
            estimatedPrice: price,
            locale
          }
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      submitted = true;
      website = '';
      const whatsappMessage = [
        t.whatsappGreeting,
        `${t.codeLabel}: ${result.code}`,
        '',
        `${t.nameLabel}: ${customerName.trim()}`,
        `${t.whatsapp}: ${phone.trim()}`,
        `${t.from}: ${origin.name}`,
        ...(origin.accuracy ? [`${t.accuracyLabel}: ±${origin.accuracy} m`] : []),
        `${t.to}: ${destination.name}`,
        `${t.date}: ${pickupDate}`,
        `${t.time}: ${pickupTime} WITA`,
        `${t.passengers}: ${message(t.peopleValue, { count: passengers })}`,
        `${t.distanceLabel}: ${distance} km`,
        ...(routeDuration ? [`${t.routeDurationLabel}: ${message(t.routeDuration, { minutes: routeDuration })}`] : []),
        `${t.costLabel}: ${rupiah.format(price)}`
      ].join('\n');
      if (whatsappWindow) whatsappWindow.location.href = createWhatsAppUrl(whatsappMessage, whatsapp);
      else window.location.href = createWhatsAppUrl(whatsappMessage, whatsapp);
    } catch (error) {
      whatsappWindow?.close();
      formError = error.message || t.bookingSaveFailed;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="pickup-shell">
  <div class="pickup-fields">
    <div class="location-tools">
      <div class="location-field">
        <div class="field-heading">
          <label for="planner-origin-search">{t.pickup}</label>
          <button type="button" class="map-target-button" class:active={mapTarget === 'origin'} aria-pressed={mapTarget === 'origin'} on:click={() => activateMapTarget('origin', true)}>{t.pickOnMap}</button>
        </div>
        <div class="location-search">
          <input
            id="planner-origin-search"
            bind:value={originQuery}
            autocomplete="off"
            maxlength="120"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-describedby="planner-search-status"
            aria-controls={searchTarget === 'origin' && searchResults.length ? 'planner-origin-results' : undefined}
            aria-expanded={searchTarget === 'origin' && searchResults.length > 0}
            aria-activedescendant={searchTarget === 'origin' && searchResults.length && searchActiveIndex >= 0 ? `planner-origin-result-${searchActiveIndex}` : undefined}
            placeholder={searchLoading === 'origin' ? t.searching : t.address}
            on:focus={() => activateMapTarget('origin')}
            on:focusout={handleSearchFocusOut}
            on:input={() => queuePlaceSearch('origin')}
            on:keydown={(event) => handleSearchKey(event, 'origin')}
          />
          {#if searchTarget === 'origin' && searchResults.length}
            <div id="planner-origin-results" class="place-suggestions" role="listbox" aria-label={t.searchResultsPickup}>
              {#each searchResults as place, index}
                <button id={`planner-origin-result-${index}`} type="button" role="option" tabindex="-1" aria-selected={searchActiveIndex === index} on:mouseenter={() => { if (searchTarget === 'origin') searchActiveIndex = index; }} on:click={() => chooseSearchResult('origin', place)}>{place.name}</button>
              {/each}
            </div>
          {/if}
        </div>
        <select aria-label={t.pickup} on:change={(event) => choosePreset(event, 'origin')}>
          <option value="">{t.popular}</option>
          {#each availablePlaces as place}<option value={place.id}>{place.name}</option>{/each}
        </select>
        <button class="gps-action" type="button" on:click={gpsLoading ? cancelGps : useCurrentLocation}>{gpsLoading ? t.cancelGps : t.useLocation}</button>
      </div>

      <button class="swap" type="button" on:click={swapLocations} disabled={!origin && !destination} aria-label={t.swapLocations}>⇅</button>

      <div class="location-field">
        <div class="field-heading">
          <label for="planner-destination-search">{t.destination}</label>
          <button type="button" class="map-target-button" class:active={mapTarget === 'destination'} aria-pressed={mapTarget === 'destination'} on:click={() => activateMapTarget('destination', true)}>{t.pickOnMap}</button>
        </div>
        <div class="location-search">
          <input
            id="planner-destination-search"
            bind:value={destinationQuery}
            autocomplete="off"
            maxlength="120"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-describedby="planner-search-status"
            aria-controls={searchTarget === 'destination' && searchResults.length ? 'planner-destination-results' : undefined}
            aria-expanded={searchTarget === 'destination' && searchResults.length > 0}
            aria-activedescendant={searchTarget === 'destination' && searchResults.length && searchActiveIndex >= 0 ? `planner-destination-result-${searchActiveIndex}` : undefined}
            placeholder={searchLoading === 'destination' ? t.searching : t.address}
            on:focus={() => activateMapTarget('destination')}
            on:focusout={handleSearchFocusOut}
            on:input={() => queuePlaceSearch('destination')}
            on:keydown={(event) => handleSearchKey(event, 'destination')}
          />
          {#if searchTarget === 'destination' && searchResults.length}
            <div id="planner-destination-results" class="place-suggestions" role="listbox" aria-label={t.searchResultsDestination}>
              {#each searchResults as place, index}
                <button id={`planner-destination-result-${index}`} type="button" role="option" tabindex="-1" aria-selected={searchActiveIndex === index} on:mouseenter={() => { if (searchTarget === 'destination') searchActiveIndex = index; }} on:click={() => chooseSearchResult('destination', place)}>{place.name}</button>
              {/each}
            </div>
          {/if}
        </div>
        <select aria-label={t.destination} on:change={(event) => choosePreset(event, 'destination')}>
          <option value="">{t.popular}</option>
          {#each availablePlaces as place}<option value={place.id}>{place.name}</option>{/each}
        </select>
      </div>
    </div>

    <p id="planner-search-status" class="helper location-guidance" aria-live="polite">{locationMessage || t.guidance}</p>
    {#if routeNotice}<p class="helper route-notice" role="status">{routeNotice}</p>{/if}

    <div class="map-wrap" class:has-route={routeReady}>
      <div class="map" bind:this={mapElement} role="region" aria-label={t.interactiveMap}></div>
      {#if !mapError && !mapLoading}
        <div class="map-controls">
          <button type="button" aria-label={t.zoomIn} on:click={zoomIn}>+</button>
          <button type="button" aria-label={t.zoomOut} on:click={zoomOut}>−</button>
        </div>
      {/if}
      {#if mapLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.loadingMap}</div>
      {:else if mapError}<div class="map-state error" role="alert">{mapError}</div>
      {:else if routeLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.findingRoute}</div>
      {:else if routeError}<div class="map-state error" role="alert">{routeError}</div>{/if}
    </div>
  </div>

  <form class="quote" on:submit|preventDefault={submitRequest} novalidate>
    <div class="honeypot" aria-hidden="true"><label><span>Website</span><input bind:value={website} name="website" tabindex="-1" autocomplete="off" /></label></div>
    <div class="quote-heading">
      <p>{t.estimate}</p>
      <strong class:calculating={routeLoading}>{estimateText}</strong>
      <span>{distance ? `${distance} km × ${rupiah.format(rate)}${routeDuration ? ` · ${message(t.routeDuration, { minutes: routeDuration })}` : ''}` : `${t.rate}: ${rupiah.format(rate)}`}</span>
    </div>
    <div class="route-summary" aria-live="polite">
      <div><span>{t.from}</span><b>{origin?.name ?? t.notSelected}</b></div>
      <div><span>{t.to}</span><b>{destination?.name ?? t.notSelected}</b></div>
    </div>
    <label><span>{t.customer}</span><input bind:value={customerName} autocomplete="name" placeholder={t.fullName} /></label>
    <label><span>{t.whatsapp}</span><input bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="0812 3456 7890" /></label>
    <div class="form-row"><label><span>{t.date}</span><input bind:value={pickupDate} type="date" min={today} /></label><label><span>{t.time}</span><input bind:value={pickupTime} type="time" /></label></div>
    <label><span>{t.passengers}</span><input bind:value={passengers} type="number" min="1" max="12" /></label>
    {#if formError}<p class="form-message error" role="alert">{formError}</p>{/if}{#if submitted}<p class="form-message success" role="status">{t.bookingOpened}</p>{/if}
    <button class="submit" type="submit" disabled={submitting}>{submitting ? t.saving : t.bookTravel}</button>
    <small>{t.estimateNote}</small>
  </form>
</div>
