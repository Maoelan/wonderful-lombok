<script>
  import { onMount } from 'svelte';
  import { calculatePickupPrice, places, readRoadRoute } from './pickup.js';
  import { createWhatsAppUrl } from './whatsapp.js';

  let mapElement;
  let map;
  let routeLayer;
  let mapLoading = true;
  let mapError = '';
  let routeLoading = false;
  let routeError = '';
  let distance = 0;
  let routeRequest = 0;
  let originId = '';
  let destinationId = '';
  let customerName = '';
  let phone = '';
  let pickupDate = '';
  let pickupTime = '';
  let passengers = 1;
  let formError = '';
  let submitted = false;
  let submitting = false;

  export let rate = 10_000;
  export let whatsapp = '6281916550731';
  const today = new Date().toISOString().slice(0, 10);
  const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  $: origin = places.find((place) => place.id === originId);
  $: destination = places.find((place) => place.id === destinationId);
  $: price = calculatePickupPrice(distance, rate);
  $: routeReady = Boolean(origin && destination && origin.id !== destination.id);
  $: if (map) drawRoute(origin, destination);

  onMount(async () => {
    try {
      const L = await import('leaflet');
      map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true }).setView([-8.65, 116.17], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      routeLayer = L.layerGroup().addTo(map);
      mapLoading = false;
    } catch (error) {
      mapLoading = false;
      mapError = 'Peta belum dapat dimuat. Periksa koneksi lalu coba lagi.';
    }
  });

  async function drawRoute(from, to) {
    if (!routeLayer || !map) return;
    const requestId = ++routeRequest;
    const L = await import('leaflet');
    routeLayer.clearLayers();
    distance = 0;
    routeError = '';
    if (!from || !to || from.id === to.id) {
      routeLoading = false;
      map.setView([-8.65, 116.17], 9);
      return;
    }

    routeLoading = true;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Layanan rute belum dapat diakses.');
      const roadRoute = readRoadRoute(await response.json());
      if (requestId !== routeRequest) return;

      distance = roadRoute.distanceKm;
      L.circleMarker([from.lat, from.lng], { radius: 7, color: '#123f35', fillColor: '#f2b84b', fillOpacity: 1, weight: 3 })
        .bindTooltip('Jemput: ' + from.name)
        .addTo(routeLayer);
      L.circleMarker([to.lat, to.lng], { radius: 7, color: '#123f35', fillColor: '#fffaf0', fillOpacity: 1, weight: 3 })
        .bindTooltip('Tujuan: ' + to.name)
        .addTo(routeLayer);
      L.polyline(roadRoute.points, { color: '#123f35', weight: 4 }).addTo(routeLayer);
      map.fitBounds(roadRoute.points, { padding: [48, 48] });
    } catch (error) {
      if (requestId !== routeRequest) return;
      routeError = error.message || 'Rute jalan belum dapat dihitung. Coba lagi.';
    } finally {
      if (requestId === routeRequest) routeLoading = false;
    }
  }

  function swapLocations() {
    [originId, destinationId] = [destinationId, originId];
  }

  async function submitRequest() {
    formError = '';
    submitted = false;
    if (!routeReady) {
      formError = 'Pilih lokasi jemput dan tujuan yang berbeda.';
      return;
    }
    if (routeLoading || routeError || !distance) {
      formError = 'Tunggu sampai rute jalan dan biayanya berhasil dihitung.';
      return;
    }
    if (!customerName.trim() || !phone.trim() || !pickupDate || !pickupTime) {
      formError = 'Lengkapi nama, WhatsApp, tanggal, dan waktu penjemputan.';
      return;
    }
    submitting = true;
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        name: customerName, whatsapp: phone, travelDate: pickupDate, people: Number(passengers), serviceType: 'travel', serviceName: 'Paket Travel',
        details: { origin: origin.name, destination: destination.name, pickupTime, distanceKm: distance, estimatedPrice: price }
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      submitted = true;
    const message = [
      'Halo Wonderful Lombok, saya ingin memesan Paket Travel.',
      `Kode: ${result.code}`,
      '',
      `Nama: ${customerName.trim()}`,
      `WhatsApp: ${phone.trim()}`,
      `Dari: ${origin.name}`,
      `Tujuan: ${destination.name}`,
      `Tanggal: ${pickupDate}`,
      `Waktu: ${pickupTime} WITA`,
      `Penumpang: ${passengers} orang`,
      `Estimasi jarak: ${distance} km`,
      `Estimasi biaya: ${rupiah.format(price)}`
    ].join('\n');
    window.open(createWhatsAppUrl(message, whatsapp), '_blank', 'noopener,noreferrer');
    } catch (error) {
      formError = error.message || 'Pemesanan belum dapat disimpan.';
    } finally { submitting = false; }
  }
</script>

<div class="pickup-shell">
  <div class="pickup-fields">
    <div class="route-fields" aria-label="Rute penjemputan">
      <label>
        <span>Lokasi jemput</span>
        <select bind:value={originId} aria-describedby="route-help">
          <option value="">Pilih titik jemput</option>
          {#each places as place}
            <option value={place.id}>{place.name}</option>
          {/each}
        </select>
      </label>

      <button class="swap" type="button" on:click={swapLocations} disabled={!originId && !destinationId} aria-label="Tukar lokasi jemput dan tujuan">
        ⇅
      </button>

      <label>
        <span>Tujuan</span>
        <select bind:value={destinationId} aria-describedby="route-help">
          <option value="">Pilih tujuan</option>
          {#each places as place}
            <option value={place.id}>{place.name}</option>
          {/each}
        </select>
      </label>
    </div>
    <p id="route-help" class="helper">Jarak dan biaya dihitung mengikuti rute berkendara, bukan garis lurus.</p>

    <div class="map-wrap" class:has-route={routeReady}>
      <div class="map" bind:this={mapElement} aria-label="Peta rute penjemputan"></div>
      {#if mapLoading}
        <div class="map-state" role="status"><span class="spinner"></span>Memuat peta Lombok</div>
      {:else if mapError}
        <div class="map-state error" role="alert">{mapError}</div>
      {:else if routeLoading}
        <div class="map-state" role="status"><span class="spinner"></span>Mencari rute jalan</div>
      {:else if routeError}
        <div class="map-state error" role="alert">{routeError}</div>
      {:else if !routeReady}
        <div class="map-state empty">Pilih dua lokasi untuk menggambar rute.</div>
      {/if}
    </div>
  </div>

  <form class="quote" on:submit|preventDefault={submitRequest} novalidate>
    <div class="quote-heading">
      <p>Estimasi perjalanan</p>
      <strong>{routeLoading ? 'Menghitung…' : price ? rupiah.format(price) : 'Rp0'}</strong>
      <span>{distance ? `${distance} km rute jalan × ${rupiah.format(rate)}` : 'Tarif Rp10.000 per km rute jalan'}</span>
    </div>

    <div class="route-summary" aria-live="polite">
      <div><span>Dari</span><b>{origin?.name ?? 'Belum dipilih'}</b></div>
      <div><span>Ke</span><b>{destination?.name ?? 'Belum dipilih'}</b></div>
    </div>

    <label>
      <span>Nama pemesan</span>
      <input bind:value={customerName} autocomplete="name" placeholder="Nama lengkap" />
    </label>
    <label>
      <span>Nomor WhatsApp</span>
      <input bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="Contoh: 0812 3456 7890" />
    </label>
    <div class="form-row">
      <label>
        <span>Tanggal</span>
        <input bind:value={pickupDate} type="date" min={today} />
      </label>
      <label>
        <span>Waktu</span>
        <input bind:value={pickupTime} type="time" />
      </label>
    </div>
    <label>
      <span>Jumlah penumpang</span>
      <input bind:value={passengers} type="number" min="1" max="12" />
    </label>

    {#if formError}
      <p class="form-message error" role="alert">{formError}</p>
    {/if}
    {#if submitted}
      <p class="form-message success" role="status">Ringkasan Paket Travel sudah dibuka di WhatsApp.</p>
    {/if}

    <button class="submit" type="submit" disabled={submitting}>{submitting ? 'Menyimpan pemesanan…' : 'Pesan Paket Travel via WhatsApp'}</button>
    <small>Harga merupakan perkiraan. Tim Wonderful Lombok akan mengonfirmasi detail perjalanan melalui WhatsApp.</small>
  </form>
</div>
