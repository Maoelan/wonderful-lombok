<script>
  import { onDestroy, onMount } from 'svelte';
  import { calculatePickupPrice, isInsideLombok, places, readRoadRoute } from './pickup.js';
  import { createWhatsAppUrl } from './whatsapp.js';
  import { getFormCopy } from './i18n.js';

  let mapElement, map, routeLayer;
  let mapLoading = true, mapError = '', routeLoading = false, routeError = '';
  let distance = 0, routeRequest = 0;
  let origin = null, destination = null, originQuery = '', destinationQuery = '';
  let mapTarget = 'origin', locationMessage = '', searchLoading = '', searchTarget = '', searchResults = [];
  let searchTimer = null, searchController = null;
  let gpsLoading = false, gpsWatch = null, gpsTimer = null;
  let customerName = '', phone = '', pickupDate = '', pickupTime = '', passengers = 1;
  let formError = '', submitted = false, submitting = false;

  export let rate = 10_000;
  export let whatsapp = '6281916550731';
  export let locale = 'id';
  $: t = getFormCopy(locale);
  const today = new Date().toISOString().slice(0, 10);
  $: rupiah = new Intl.NumberFormat(locale !== 'id' ? 'en-US' : 'id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  $: price = calculatePickupPrice(distance, rate);
  $: routeReady = Boolean(origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng));
  $: if (map) drawRoute(origin, destination);

  onMount(async () => {
    try {
      const L = await import('leaflet');
      map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true }).setView([-8.65, 116.17], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      routeLayer = L.layerGroup().addTo(map);
      map.on('click', ({ latlng }) => setLocation(mapTarget, { name: `Titik peta ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`, lat: latlng.lat, lng: latlng.lng }));
      mapLoading = false;
    } catch { mapLoading = false; mapError = 'Peta belum dapat dimuat. Periksa koneksi lalu coba lagi.'; }
  });

  onDestroy(() => { stopGps(); clearTimeout(searchTimer); searchController?.abort(); });

  function setLocation(target, place) {
    if (target === 'origin') { origin = place; originQuery = place.name; }
    else { destination = place; destinationQuery = place.name; }
    searchTarget = '';
    searchResults = [];
    locationMessage = `${target === 'origin' ? 'Lokasi jemput' : 'Tujuan'} dipilih: ${place.name}`;
  }

  function activateMapTarget(target) {
    mapTarget = target;
    locationMessage = `Ketik alamat lalu tekan Enter, atau klik peta untuk memilih ${target === 'origin' ? 'lokasi jemput' : 'tujuan'}.`;
  }

  function choosePreset(target, id) {
    const place = places.find((item) => item.id === id);
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
    if (query.length < 3) { locationMessage = 'Ketik minimal 3 karakter untuk mencari nama tempat.'; return; }
    searchController?.abort();
    searchController = new AbortController();
    searchLoading = target;
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(locale)}`, { signal: searchController.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pencarian tempat gagal.');
      searchTarget = target;
      searchResults = result.results || [];
      if (!searchResults.length) { locationMessage = 'Tempat tidak ditemukan di Pulau Lombok. Coba nama desa, hotel, atau objek wisata.'; return; }
      locationMessage = `${searchResults.length} tempat ditemukan di Lombok. Pilih hasil yang paling sesuai.`;
      if (chooseFirst) {
        const [place] = searchResults;
        setLocation(target, place);
        map?.setView([place.lat, place.lng], 14);
      }
    } catch (error) {
      if (error.name !== 'AbortError') locationMessage = error.message || 'Pencarian tempat gagal.';
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

  function useCurrentLocation() {
    if (!navigator.geolocation) { locationMessage = 'Perangkat ini tidak mendukung GPS.'; return; }
    stopGps();
    gpsLoading = true;
    locationMessage = 'Mencari sinyal GPS terbaik… tetap di halaman ini hingga akurasi stabil.';
    let best = null;
    const finish = () => {
      if (!best) { stopGps(); locationMessage = 'Lokasi tidak dapat dibaca. Izinkan akses lokasi atau pilih titik pada peta.'; return; }
      const { latitude: lat, longitude: lng, accuracy } = best;
      stopGps();
      if (!isInsideLombok(lat, lng)) { locationMessage = 'GPS menunjukkan lokasi di luar Pulau Lombok. Gunakan pencarian atau pilih titik pada peta.'; return; }
      setLocation('origin', { name: `Lokasi saya saat ini (akurasi ±${Math.round(accuracy)} m)`, lat, lng });
      map?.setView([lat, lng], accuracy <= 100 ? 17 : 15);
    };
    gpsWatch = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!best || coords.accuracy < best.accuracy) best = coords;
        locationMessage = `Mencari sinyal GPS… akurasi terbaik ±${Math.round(best.accuracy)} m.`;
        if (best.accuracy <= 35) finish();
      },
      (error) => { if (error.code === error.PERMISSION_DENIED) { stopGps(); locationMessage = 'Akses lokasi ditolak. Izinkan lokasi pada pengaturan browser atau pilih titik pada peta.'; } },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
    gpsTimer = setTimeout(finish, 15_000);
  }

  async function drawRoute(from, to) {
    if (!routeLayer || !map) return;
    const requestId = ++routeRequest;
    const L = await import('leaflet');
    routeLayer.clearLayers(); distance = 0; routeError = '';
    if (from) L.circleMarker([from.lat, from.lng], { radius: 7, color: '#123f35', fillColor: '#f2b84b', fillOpacity: 1, weight: 3 }).bindTooltip('Jemput: ' + from.name).addTo(routeLayer);
    if (to) L.circleMarker([to.lat, to.lng], { radius: 7, color: '#123f35', fillColor: '#fffaf0', fillOpacity: 1, weight: 3 }).bindTooltip('Tujuan: ' + to.name).addTo(routeLayer);
    if (!routeReady) { routeLoading = false; return; }
    routeLoading = true;
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      if (!response.ok) throw new Error('Layanan rute belum dapat diakses.');
      const roadRoute = readRoadRoute(await response.json());
      if (requestId !== routeRequest) return;
      distance = roadRoute.distanceKm;
      L.polyline(roadRoute.points, { color: '#123f35', weight: 4 }).addTo(routeLayer);
      map.fitBounds(roadRoute.points, { padding: [48, 48] });
    } catch (error) { if (requestId === routeRequest) routeError = error.message || 'Rute jalan belum dapat dihitung.'; }
    finally { if (requestId === routeRequest) routeLoading = false; }
  }

  function swapLocations() {
    [origin, destination] = [destination, origin];
    [originQuery, destinationQuery] = [destinationQuery, originQuery];
  }

  async function submitRequest() {
    formError = ''; submitted = false;
    if (!routeReady) { formError = 'Pilih lokasi jemput dan tujuan yang berbeda.'; return; }
    if (routeLoading || routeError || !distance) { formError = 'Tunggu sampai rute jalan dan biayanya berhasil dihitung.'; return; }
    if (!customerName.trim() || !phone.trim() || !pickupDate || !pickupTime) { formError = 'Lengkapi nama, WhatsApp, tanggal, dan waktu penjemputan.'; return; }
    submitting = true;
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: customerName, whatsapp: phone, travelDate: pickupDate, people: Number(passengers), serviceType: 'travel', serviceName: 'Paket Travel', details: { origin: origin.name, destination: destination.name, originCoordinates: [origin.lat, origin.lng], destinationCoordinates: [destination.lat, destination.lng], pickupTime, distanceKm: distance, estimatedPrice: price } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      submitted = true;
      const message = ['Halo Wonderful Lombok, saya ingin memesan Paket Travel.', `Kode: ${result.code}`, '', `Nama: ${customerName.trim()}`, `WhatsApp: ${phone.trim()}`, `Dari: ${origin.name}`, `Tujuan: ${destination.name}`, `Tanggal: ${pickupDate}`, `Waktu: ${pickupTime} WITA`, `Penumpang: ${passengers} orang`, `Estimasi jarak: ${distance} km`, `Estimasi biaya: ${rupiah.format(price)}`].join('\n');
      if (whatsappWindow) whatsappWindow.location.href = createWhatsAppUrl(message, whatsapp);
      else window.location.href = createWhatsAppUrl(message, whatsapp);
    } catch (error) { whatsappWindow?.close(); formError = error.message || 'Pemesanan belum dapat disimpan.'; }
    finally { submitting = false; }
  }
</script>

<div class="pickup-shell">
  <div class="pickup-fields">
    <div class="location-tools">
      <div class="location-field">
        <div class="location-search"><label><span>{t.pickup}</span><input bind:value={originQuery} autocomplete="off" placeholder={searchLoading === 'origin' ? t.searching : t.address} on:focus={() => { activateMapTarget('origin'); queuePlaceSearch('origin'); }} on:input={() => queuePlaceSearch('origin')} on:keydown={(event) => handleSearchKey(event, 'origin')} /></label>{#if searchTarget === 'origin' && searchResults.length}<div class="place-suggestions" role="listbox" aria-label="Hasil pencarian lokasi jemput">{#each searchResults as place}<button type="button" role="option" aria-selected="false" on:click={() => chooseSearchResult('origin', place)}>{place.name}</button>{/each}</div>{/if}</div>
        <button class="gps-action" type="button" on:click={useCurrentLocation} disabled={gpsLoading}>{gpsLoading ? t.locating : t.useLocation}</button>
        <select aria-label={t.pickup} on:change={(event) => choosePreset('origin', event.currentTarget.value)}><option value="">{t.popular}</option>{#each places as place}<option value={place.id}>{place.name}</option>{/each}</select>
      </div>
      <button class="swap" type="button" on:click={swapLocations} disabled={!origin && !destination} aria-label="Tukar lokasi jemput dan tujuan">⇅</button>
      <div class="location-field">
        <div class="location-search"><label><span>{t.destination}</span><input bind:value={destinationQuery} autocomplete="off" placeholder={searchLoading === 'destination' ? t.searching : t.address} on:focus={() => { activateMapTarget('destination'); queuePlaceSearch('destination'); }} on:input={() => queuePlaceSearch('destination')} on:keydown={(event) => handleSearchKey(event, 'destination')} /></label>{#if searchTarget === 'destination' && searchResults.length}<div class="place-suggestions" role="listbox" aria-label="Hasil pencarian tujuan">{#each searchResults as place}<button type="button" role="option" aria-selected="false" on:click={() => chooseSearchResult('destination', place)}>{place.name}</button>{/each}</div>{/if}</div>
        <select aria-label={t.destination} on:change={(event) => choosePreset('destination', event.currentTarget.value)}><option value="">{t.popular}</option>{#each places as place}<option value={place.id}>{place.name}</option>{/each}</select>
      </div>
    </div>
    <p class="helper location-guidance" aria-live="polite">{locationMessage || t.guidance}</p>
    <div class="map-wrap" class:has-route={routeReady}>
      <div class="map" bind:this={mapElement} aria-label="Peta interaktif rute penjemputan"></div>
      {#if mapLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.loadingMap}</div>{:else if mapError}<div class="map-state error" role="alert">{mapError}</div>{:else if routeLoading}<div class="map-state" role="status"><span class="spinner"></span>{t.findingRoute}</div>{:else if routeError}<div class="map-state error" role="alert">{routeError}</div>{/if}
    </div>
  </div>

  <form class="quote" on:submit|preventDefault={submitRequest} novalidate>
    <div class="quote-heading"><p>{t.estimate}</p>{#key price}<strong class:calculating={routeLoading}>{routeLoading ? t.calculating : price ? rupiah.format(price) : 'Rp0'}</strong>{/key}<span>{distance ? `${distance} km × ${rupiah.format(rate)}` : `${t.rate}: ${rupiah.format(rate)}`}</span></div>
    <div class="route-summary" aria-live="polite"><div><span>{t.from}</span><b>{origin?.name ?? t.notSelected}</b></div><div><span>{t.to}</span><b>{destination?.name ?? t.notSelected}</b></div></div>
    <label><span>{t.customer}</span><input bind:value={customerName} autocomplete="name" placeholder={t.fullName} /></label>
    <label><span>{t.whatsapp}</span><input bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="0812 3456 7890" /></label>
    <div class="form-row"><label><span>{t.date}</span><input bind:value={pickupDate} type="date" min={today} /></label><label><span>{t.time}</span><input bind:value={pickupTime} type="time" /></label></div>
    <label><span>{t.passengers}</span><input bind:value={passengers} type="number" min="1" max="12" /></label>
    {#if formError}<p class="form-message error" role="alert">{formError}</p>{/if}{#if submitted}<p class="form-message success" role="status">{locale !== 'id' ? 'The travel request has opened in WhatsApp.' : 'Ringkasan Paket Travel sudah dibuka di WhatsApp.'}</p>{/if}
    <button class="submit" type="submit" disabled={submitting}>{submitting ? t.saving : t.bookTravel}</button>
    <small>{t.estimateNote}</small>
  </form>
</div>
