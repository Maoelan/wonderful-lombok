<script>
  import { onDestroy, onMount } from 'svelte';
  import { calculatePickupPrice, isInsideLombok, lombokBounds, places, readRoadRoute } from './pickup.js';
  import { createWhatsAppUrl } from './whatsapp.js';

  let mapElement, map, routeLayer;
  let mapLoading = true, mapError = '', routeLoading = false, routeError = '';
  let distance = 0, routeRequest = 0;
  let origin = null, destination = null, originQuery = '', destinationQuery = '';
  let mapTarget = 'origin', locationMessage = '', searchLoading = '';
  let gpsLoading = false, gpsWatch = null, gpsTimer = null;
  let customerName = '', phone = '', pickupDate = '', pickupTime = '', passengers = 1;
  let formError = '', submitted = false, submitting = false;

  export let rate = 10_000;
  export let whatsapp = '6281916550731';
  const today = new Date().toISOString().slice(0, 10);
  const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

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

  onDestroy(stopGps);

  function setLocation(target, place) {
    if (target === 'origin') { origin = place; originQuery = place.name; }
    else { destination = place; destinationQuery = place.name; }
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

  async function searchAddress(target) {
    const query = (target === 'origin' ? originQuery : destinationQuery).trim();
    if (query.length < 3) { locationMessage = 'Ketik minimal 3 karakter untuk mencari alamat.'; return; }
    searchLoading = target;
    try {
      const viewbox = `${lombokBounds.west},${lombokBounds.north},${lombokBounds.east},${lombokBounds.south}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&bounded=1&viewbox=${viewbox}&q=${encodeURIComponent(`${query}, Lombok, Nusa Tenggara Barat`)}`, { headers: { 'accept-language': 'id' } });
      const [result] = await response.json();
      if (!result) throw new Error('Alamat tidak ditemukan. Coba kata kunci yang lebih spesifik.');
      const lat = Number(result.lat), lng = Number(result.lon);
      if (!isInsideLombok(lat, lng)) throw new Error('Alamat berada di luar Pulau Lombok.');
      setLocation(target, { name: result.display_name, lat, lng });
      map?.setView([lat, lng], 14);
    } catch (error) { locationMessage = error.message || 'Pencarian alamat gagal.'; }
    finally { searchLoading = ''; }
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
    if (!routeReady) { routeLoading = false; return; }
    routeLoading = true;
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      if (!response.ok) throw new Error('Layanan rute belum dapat diakses.');
      const roadRoute = readRoadRoute(await response.json());
      if (requestId !== routeRequest) return;
      distance = roadRoute.distanceKm;
      L.circleMarker([from.lat, from.lng], { radius: 7, color: '#123f35', fillColor: '#f2b84b', fillOpacity: 1, weight: 3 }).bindTooltip('Jemput: ' + from.name).addTo(routeLayer);
      L.circleMarker([to.lat, to.lng], { radius: 7, color: '#123f35', fillColor: '#fffaf0', fillOpacity: 1, weight: 3 }).bindTooltip('Tujuan: ' + to.name).addTo(routeLayer);
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
        <label><span>Lokasi jemput</span><input bind:value={originQuery} placeholder={searchLoading === 'origin' ? 'Mencari alamat…' : 'Ketik alamat, lalu tekan Enter'} on:focus={() => activateMapTarget('origin')} on:keydown={(event) => event.key === 'Enter' && searchAddress('origin')} /></label>
        <button class="gps-action" type="button" on:click={useCurrentLocation} disabled={gpsLoading}>{gpsLoading ? 'Mencari GPS…' : 'Gunakan lokasi saya'}</button>
        <select aria-label="Lokasi jemput populer" on:change={(event) => choosePreset('origin', event.currentTarget.value)}><option value="">Atau pilih lokasi populer</option>{#each places as place}<option value={place.id}>{place.name}</option>{/each}</select>
      </div>
      <button class="swap" type="button" on:click={swapLocations} disabled={!origin && !destination} aria-label="Tukar lokasi jemput dan tujuan">⇅</button>
      <div class="location-field">
        <label><span>Tujuan</span><input bind:value={destinationQuery} placeholder={searchLoading === 'destination' ? 'Mencari alamat…' : 'Ketik alamat, lalu tekan Enter'} on:focus={() => activateMapTarget('destination')} on:keydown={(event) => event.key === 'Enter' && searchAddress('destination')} /></label>
        <select aria-label="Tujuan populer" on:change={(event) => choosePreset('destination', event.currentTarget.value)}><option value="">Atau pilih lokasi populer</option>{#each places as place}<option value={place.id}>{place.name}</option>{/each}</select>
      </div>
    </div>
    <p class="helper location-guidance" aria-live="polite"><strong>{mapTarget === 'origin' ? 'Mengatur lokasi jemput.' : 'Mengatur tujuan.'}</strong> {locationMessage || 'Ketik alamat lalu tekan Enter, pilih lokasi populer, atau klik langsung pada peta.'}</p>
    <div class="map-wrap" class:has-route={routeReady}>
      <div class="map" bind:this={mapElement} aria-label="Peta interaktif rute penjemputan"></div>
      {#if mapLoading}<div class="map-state" role="status"><span class="spinner"></span>Memuat peta Lombok</div>{:else if mapError}<div class="map-state error" role="alert">{mapError}</div>{:else if routeLoading}<div class="map-state" role="status"><span class="spinner"></span>Mencari rute jalan</div>{:else if routeError}<div class="map-state error" role="alert">{routeError}</div>{/if}
    </div>
  </div>

  <form class="quote" on:submit|preventDefault={submitRequest} novalidate>
    <div class="quote-heading"><p>Estimasi perjalanan</p>{#key price}<strong class:calculating={routeLoading}>{routeLoading ? 'Menghitung…' : price ? rupiah.format(price) : 'Rp0'}</strong>{/key}<span>{distance ? `${distance} km rute jalan × ${rupiah.format(rate)}` : `Tarif ${rupiah.format(rate)} per km rute jalan`}</span></div>
    <div class="route-summary" aria-live="polite"><div><span>Dari</span><b>{origin?.name ?? 'Belum dipilih'}</b></div><div><span>Ke</span><b>{destination?.name ?? 'Belum dipilih'}</b></div></div>
    <label><span>Nama pemesan</span><input bind:value={customerName} autocomplete="name" placeholder="Nama lengkap" /></label>
    <label><span>Nomor WhatsApp</span><input bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="Contoh: 0812 3456 7890" /></label>
    <div class="form-row"><label><span>Tanggal</span><input bind:value={pickupDate} type="date" min={today} /></label><label><span>Waktu</span><input bind:value={pickupTime} type="time" /></label></div>
    <label><span>Jumlah penumpang</span><input bind:value={passengers} type="number" min="1" max="12" /></label>
    {#if formError}<p class="form-message error" role="alert">{formError}</p>{/if}{#if submitted}<p class="form-message success" role="status">Ringkasan Paket Travel sudah dibuka di WhatsApp.</p>{/if}
    <button class="submit" type="submit" disabled={submitting}>{submitting ? 'Menyimpan pemesanan…' : 'Pesan Paket Travel via WhatsApp'}</button>
    <small>Harga merupakan perkiraan. Tim Wonderful Lombok akan mengonfirmasi detail perjalanan melalui WhatsApp.</small>
  </form>
</div>
