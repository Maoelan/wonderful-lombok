<script>
  import { onMount } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { slugify } from '#lib/i18n.js';
  import { createUnsavedChangesGuard } from '#lib/unsaved-changes.js';
  import RichTextEditor from '#lib/RichTextEditor.svelte';
  import TrashIcon from '#lib/TrashIcon.svelte';
  import UiIcon from '#lib/UiIcon.svelte';
  export let data;
  let catalog = structuredClone(data.catalog);
  let catalogRevision = data.catalogRevision ?? 0;
  let bookings = data.bookings;
  let bookingsCursor = data.bookingsNextCursor ?? null;
  let bookingsLoadedMore = false;
  let active = 'overview';
  let adminMenuOpen = false;
  let selectedPackage = 0;
  let selectedDestination = 0;
  let packageEditorOpen = false;
  let destinationEditorOpen = false;
  let saved = false;
  let dirty = false;
  let saving = false;
  let editVersion = 0;
  let saveError = '';
  let uploading = '';
  let bookingsLoading = false;
  let deletingBookingId = '';
  let statusSavingId = '';

  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const formatCurrency = (value) => Number.isFinite(value) ? currency.format(value) : '';

  const leaveGuard = createUnsavedChangesGuard({
    isDirty: () => dirty,
    confirmLeave: () => window.confirm('Ada perubahan yang belum disimpan. Tinggalkan halaman admin?')
  });
  beforeNavigate(leaveGuard.beforeNavigate);

  $: newBookings = bookings.filter((item) => item.status === 'baru');
  $: editing = active === 'packages' && packageEditorOpen || active === 'destinations' && destinationEditorOpen;
  $: selectedObject = active === 'packages' ? catalog.packages[Math.min(selectedPackage, catalog.packages.length - 1)] : catalog.destinations[Math.min(selectedDestination, catalog.destinations.length - 1)];
  function openEditor(kind, index) {
    if (kind === 'packages') { selectedPackage = index; packageEditorOpen = true; }
    else { selectedDestination = index; destinationEditorOpen = true; }
  }
  function changeView(view) {
    active = view; packageEditorOpen = false; destinationEditorOpen = false; adminMenuOpen = false;
  }
  $: pageInfo = ({
    overview: ['Ringkasan', 'Pilih pekerjaan yang ingin dilakukan hari ini.'],
    bookings: ['Pemesanan', 'Periksa permintaan pelanggan dan perbarui statusnya.'],
    packages: ['Paket wisata', 'Tambah atau perbarui paket yang tampil di website.'],
    destinations: ['Destinasi', 'Kelola inspirasi tempat yang dapat dikunjungi pelanggan.'],
    travel: ['Paket travel', 'Atur tarif perjalanan berdasarkan jarak.'],
    rentals: ['Rental', 'Kelola kendaraan dan harga sewa yang tampil di website.'],
    faqs: ['Pertanyaan umum', 'Siapkan jawaban untuk pertanyaan pelanggan.'],
    settings: ['Website dan kontak', 'Atur halaman utama, kontak, tampilan, dan media sosial.']
  })[active] || ['Admin', 'Kelola konten website.'];

  onMount(() => {
    const timer = window.setInterval(() => { if (!document.hidden) refreshBookings(true); }, 15_000);
    const refreshVisible = () => { if (!document.hidden) refreshBookings(true); };
    document.addEventListener('visibilitychange', refreshVisible);
    window.addEventListener('beforeunload', leaveGuard.beforeUnload);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshVisible);
      window.removeEventListener('beforeunload', leaveGuard.beforeUnload);
    };
  });

  async function refreshBookings(silent = false, append = false) {
    if (deletingBookingId || statusSavingId) return;
    if (silent && bookingsLoadedMore) return;
    if (append && !bookingsCursor) return;
    if (!silent) bookingsLoading = true;
    try {
      const cursor = append ? bookingsCursor : null;
      const response = await fetch(`/api/admin/bookings${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Pemesanan gagal dimuat.');
      const page = Array.isArray(result.bookings) ? result.bookings : [];
      if (append) {
        const known = new Set(bookings.map((booking) => booking.id));
        bookings = [...bookings, ...page.filter((booking) => !known.has(booking.id))];
        bookingsLoadedMore = true;
      } else {
        bookings = page;
        bookingsLoadedMore = false;
      }
      bookingsCursor = typeof result.nextCursor === 'string' ? result.nextCursor : null;
    } catch (error) {
      if (!silent) saveError = error.message;
    } finally {
      bookingsLoading = false;
    }
  }

  async function persist() {
    if (saving || uploading) {
      if (uploading) saveError = 'Tunggu unggahan gambar selesai sebelum menyimpan.';
      return;
    }
    saveError = '';
    if (!/^62\d{8,13}$/.test(catalog.settings.whatsapp.replace(/\D/g, ''))) {
      saveError = 'Nomor WhatsApp harus memakai format internasional, misalnya 628123456789.';
      active = 'settings';
      return;
    }
    if (!catalog.settings.email.includes('@')) {
      saveError = 'Masukkan alamat email yang valid.';
      active = 'settings';
      return;
    }
    saving = true;
    const editVersionAtSave = editVersion;
    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ catalog, expectedRevision: catalogRevision })
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 409) {
        dirty = true;
        saved = false;
        saveError = result.error || 'Katalog telah diubah oleh sesi admin lain. Muat ulang halaman admin sebelum menyimpan lagi.';
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Perubahan gagal disimpan.');
      if (!Number.isInteger(result.revision)) throw new Error('Respons penyimpanan tidak valid. Muat ulang halaman admin.');
      catalogRevision = result.revision;
      if (editVersion === editVersionAtSave) {
        dirty = false;
        saved = true;
        setTimeout(() => saved = false, 2400);
      } else {
        dirty = true;
        saved = false;
      }
    } catch (error) {
      saveError = error.message;
    } finally {
      saving = false;
    }
  }

  function updatePackage(index, field, value) {
    catalog.packages[index][field] = value;
    catalog = { ...catalog };
  }

  function markDirty(event) {
    if (event?.target?.closest('.booking-admin-list, [data-admin-ui]')) return;
    dirty = true;
    saved = false;
    editVersion += 1;
  }

  function confirmLogout(event) {
    if (dirty && !window.confirm('Ada perubahan yang belum disimpan. Keluar dari admin?')) event.preventDefault();
  }

  function nextSlug(prefix, items, field = 'slug') {
    const used = new Set((items || []).map((item) => item[field]).filter(Boolean));
    let index = (items || []).length + 1;
    let slug = `${prefix}-${index}`;
    while (used.has(slug)) {
      index += 1;
      slug = `${prefix}-${index}`;
    }
    return slug;
  }

  function updateRental(index, field, value) {
    catalog.rentals[index][field] = value;
    catalog = { ...catalog };
  }

  function addPackage() {
    const name = 'Paket baru';
    catalog.packages = [...catalog.packages, { slug: nextSlug(slugify(name), catalog.packages), category: 'Private tour', duration: '1 hari', name, route: 'Isi destinasi paket', detail: 'Isi detail paket', price: 'Rp0', unit: 'per orang', image: '', images: [], destinationSlugs: [], itinerary: [{ day: 'Hari 1', title: 'Judul perjalanan', items: ['Aktivitas pertama'] }], includes: ['Transportasi'], excludes: ['Pengeluaran pribadi'], priceTiers: [{ key: 'tier-1', guests: '1–2 orang', price: 'Rp0', note: 'per orang' }] }];
    catalog = { ...catalog };
    selectedPackage = catalog.packages.length - 1;
    packageEditorOpen = true;
    markDirty();
  }

  function updateLines(index, field, value) { updatePackage(index, field, value.split('\n').map((line) => line.trim()).filter(Boolean)); }
  function parseItinerary(value, dayPrefix) {
    return value.split('\n\n').map((block, dayIndex) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      return { day: `${dayPrefix} ${dayIndex + 1}`, title: lines[0] || '', items: lines.slice(1) };
    }).filter((day) => day.title);
  }
  function updateItinerary(index, value) { updatePackage(index, 'itinerary', parseItinerary(value, 'Hari')); }
  function updateItineraryEn(index, value) { updatePackage(index, 'itineraryEn', parseItinerary(value, 'Day')); }
  function itineraryText(days) { return (days || []).map((day) => [day.title, ...(day.items || [])].join('\n')).join('\n\n'); }
  function addPriceTier(index) { const tiers = catalog.packages[index].priceTiers || []; updatePackage(index, 'priceTiers', [...tiers, { key: nextSlug('tier', tiers, 'key'), guests: '1 orang', guestsEn: '', price: 'Rp0', note: 'per orang', noteEn: '' }]); markDirty(); }
  function updatePriceTier(packageIndex, tierIndex, field, value) { catalog.packages[packageIndex].priceTiers[tierIndex][field] = value; catalog = { ...catalog }; }
  function removePriceTier(packageIndex, tierIndex) { updatePackage(packageIndex, 'priceTiers', catalog.packages[packageIndex].priceTiers.filter((_, index) => index !== tierIndex)); markDirty(); }

  function updateDestination(index, field, value) {
    catalog.destinations[index][field] = value;
    catalog = { ...catalog };
  }

  function setPackageDestination(packageIndex, slug, selected) {
    const current = catalog.packages[packageIndex].destinationSlugs || [];
    updatePackage(packageIndex, 'destinationSlugs', selected ? [...new Set([...current, slug])] : current.filter((item) => item !== slug));
    markDirty();
  }

  function addDestination() {
    catalog.destinations = [...catalog.destinations, { slug: nextSlug('destinasi', catalog.destinations), name: 'Destinasi baru', note: 'Keterangan singkat', detail: 'Isi detail destinasi', image: '', images: [] }];
    catalog = { ...catalog };
    selectedDestination = catalog.destinations.length - 1;
    destinationEditorOpen = true;
    markDirty();
  }

  function removeDestination(index) {
    if (uploadPending()) return;
    if (!confirm(`Hapus destinasi ${catalog.destinations[index].name}? Gambar yang hanya dipakai destinasi ini akan dihapus permanen setelah katalog disimpan.`)) return;
    const slug = catalog.destinations[index].slug;
    catalog.destinations = catalog.destinations.filter((_, itemIndex) => itemIndex !== index);
    destinationEditorOpen = false;
    catalog.packages = catalog.packages.map((item) => ({ ...item, destinationSlugs: (item.destinationSlugs || []).filter((value) => value !== slug) }));
    catalog = { ...catalog };
    markDirty();
  }

  function updateFaq(index, field, value) {
    catalog.faqs[index][field] = value;
    catalog = { ...catalog };
  }

  function addFaq() {
    catalog.faqs = [...catalog.faqs, { slug: nextSlug('faq', catalog.faqs), question: 'Pertanyaan baru', answer: 'Tulis jawaban yang membantu pelanggan.' }];
    catalog = { ...catalog };
    markDirty();
  }

  function removeFaq(index) {
    if (!confirm(`Hapus pertanyaan “${catalog.faqs[index].question}”?`)) return;
    catalog.faqs = catalog.faqs.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
    markDirty();
  }

  function uploadPending() {
    if (!uploading) return false;
    saveError = 'Tunggu unggahan gambar selesai sebelum mengubah katalog.';
    return true;
  }

  async function uploadImage(file, apply, key, input) {
    if (!file || uploading) return;
    uploading = key;
    saveError = '';
    try {
      const form = new FormData();
      form.set('image', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (response.status === 413 ? 'Gambar terlalu besar. Maksimal 4 MB.' : 'Gambar gagal diunggah.'));
      if (typeof result.url !== 'string' || !result.url) throw new Error('Respons upload tidak valid.');
      apply(result.url);
      markDirty();
    } catch (error) { saveError = error.message; }
    finally {
      uploading = '';
      if (input) input.value = '';
    }
  }

  function clearImage(label, apply) {
    if (uploadPending()) return;
    if (confirm(`Hapus ${label}? File media akan dihapus permanen setelah katalog disimpan.`)) { apply(''); markDirty(); }
  }

  function removeGalleryImage(images, imageIndex, apply) {
    if (uploadPending()) return;
    if (confirm(`Hapus gambar galeri nomor ${imageIndex + 1}? File media akan dihapus permanen setelah katalog disimpan.`)) { apply(images.filter((_, index) => index !== imageIndex)); markDirty(); }
  }

  function removePackage(index) {
    if (uploadPending()) return;
    if (!confirm(`Hapus paket ${catalog.packages[index].name}? Gambar yang hanya dipakai paket ini akan dihapus permanen setelah katalog disimpan.`)) return;
    catalog.packages = catalog.packages.filter((_, itemIndex) => itemIndex !== index);
    packageEditorOpen = false;
    catalog = { ...catalog };
    markDirty();
  }

  async function setBookingStatus(item, status, select) {
    if (statusSavingId) {
      if (select) select.value = item.status;
      return;
    }
    const previous = item.status;
    statusSavingId = item.id;
    saveError = '';
    try {
      const response = await fetch(`/api/admin/bookings/${item.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Status pemesanan gagal diperbarui.');
      item.status = status;
      bookings = [...bookings];
    } catch (error) {
      if (select) select.value = previous;
      saveError = error.message;
    } finally {
      statusSavingId = '';
    }
  }

  function bookingItinerary(item) {
    const details = item.details || {};
    if (Array.isArray(details.stops) && details.stops.length) {
      return details.stops.map((stop, index) => ({
        label: index === 0 ? 'Jemput' : index === details.stops.length - 1 ? 'Tujuan' : `Perhentian ${index}`,
        name: stop.name
      }));
    }
    if (details.origin || details.destination) {
      return [
        ...(details.origin ? [{ label: 'Jemput', name: details.origin }] : []),
        ...(details.destination ? [{ label: 'Tujuan', name: details.destination }] : [])
      ];
    }
    return [];
  }

  async function deleteBookingRecord(item) {
    if (deletingBookingId || statusSavingId) return;
    if (!confirm(`Hapus pemesanan ${item.code}? Data pelanggan akan dihapus permanen.`)) return;
    deletingBookingId = item.id;
    saveError = '';
    try {
      const response = await fetch(`/api/admin/bookings/${item.id}`, { method: 'DELETE' });
      if (response.status === 204) {
        bookings = bookings.filter((booking) => booking.id !== item.id);
        return;
      }
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Pemesanan gagal dihapus.');
    } catch (error) {
      saveError = error.message;
    } finally {
      deletingBookingId = '';
    }
  }
</script>

<svelte:head><title>Admin | Wonderful Lombok</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<svelte:window on:keydown={(event) => { if (event.key === 'Escape' && adminMenuOpen) { adminMenuOpen = false; document.querySelector('.admin-menu-toggle')?.focus(); } }} />

<div class="admin-shell" class:theme-ocean={catalog.settings.colorTheme === 'ocean'}>
  <aside class="admin-sidebar" class:expanded={adminMenuOpen}>
    <a class="admin-brand admin-logo" href="/" aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
    <div class="admin-workspace"><p class="admin-kicker">Pengelolaan website</p><p>Admin</p></div>
    <button class="admin-menu-toggle" type="button" aria-expanded={adminMenuOpen} aria-controls="admin-navigation" on:click={() => adminMenuOpen = !adminMenuOpen}>{adminMenuOpen ? 'Tutup menu' : 'Menu admin'}<span aria-hidden="true">{adminMenuOpen ? '−' : '+'}</span></button>
    <nav id="admin-navigation" aria-label="Menu admin">
      <p>Mulai</p>
      <button class:active={active === 'overview'} on:click={() => changeView('overview')}><UiIcon name="overview" />Ringkasan</button>
      <button class:active={active === 'bookings'} on:click={() => changeView('bookings')}><UiIcon name="booking" />Pemesanan {#if newBookings.length}<span>{newBookings.length} baru</span>{/if}</button>
      <p>Isi website</p>
      <button class:active={active === 'packages'} on:click={() => changeView('packages')}><UiIcon name="tour" />Paket wisata <span>{catalog.packages.length}</span></button>
      <button class:active={active === 'destinations'} on:click={() => changeView('destinations')}><UiIcon name="pin" />Destinasi <span>{catalog.destinations.length}</span></button>
      <button class:active={active === 'travel'} on:click={() => changeView('travel')}><UiIcon name="travel" />Jasa Travel</button>
      <button class:active={active === 'rentals'} on:click={() => changeView('rentals')}><UiIcon name="rental" />Rental <span>{catalog.rentals?.length ?? 0}</span></button>
      <button class:active={active === 'faqs'} on:click={() => changeView('faqs')}><UiIcon name="faq" />Pertanyaan umum <span>{catalog.faqs.length}</span></button>
      <p>Pengaturan</p>
      <button class:active={active === 'settings'} on:click={() => changeView('settings')}><UiIcon name="settings" />Website dan kontak</button>
    </nav>
    <a class="admin-site-link" href="/" target="_blank" rel="noreferrer">Buka website publik</a>
    <form class="admin-logout" method="POST" action="/logout" on:submit={confirmLogout}><button type="submit">Keluar dari admin</button></form>
  </aside>

  <main class="admin-main" on:input={markDirty} on:change={markDirty}>
    <div class="admin-save-bar"><span>Admin <span aria-hidden="true">/</span> {editing ? active === 'packages' ? 'Edit paket wisata' : 'Edit destinasi' : pageInfo[0]}</span><div class="admin-actions"><span class:saved aria-live="polite">{saved ? 'Perubahan tersimpan' : dirty ? 'Ada perubahan belum disimpan' : 'Semua sudah tersimpan'}</span><button class="admin-save" on:click={persist} disabled={!dirty || saving || Boolean(uploading)} aria-busy={saving || Boolean(uploading)}>{saving ? 'Menyimpan...' : uploading ? 'Menunggu unggahan...' : 'Simpan perubahan'}</button></div></div>
    <header class="admin-header">
      <div><h1>{editing ? active === 'packages' ? 'Edit paket wisata' : 'Edit destinasi' : pageInfo[0]}</h1><p>{pageInfo[1]}</p></div>
    </header>
    {#if editing && selectedObject}<div class="admin-editor-links"><button type="button" class="admin-text-button" on:click={() => { packageEditorOpen = false; destinationEditorOpen = false; }}>← {active === 'packages' ? 'Semua paket' : 'Semua destinasi'}</button><a href={`/id/${active === 'packages' ? 'paket-wisata' : 'destinasi'}/${selectedObject.slug}`} target="_blank" rel="noreferrer">Lihat halaman publik <UiIcon /></a></div>{/if}

    {#if saveError}<p class="admin-error" role="alert">{saveError}</p>{/if}

    {#if active === 'overview'}
      <section class="admin-section admin-overview" aria-labelledby="admin-overview-title">
        <div class="admin-metrics"><button type="button" on:click={() => changeView('bookings')}><span>Pemesanan baru</span><strong>{newBookings.length}</strong><small>Periksa permintaan <UiIcon /></small></button><button type="button" on:click={() => changeView('packages')}><span>Paket wisata</span><strong>{catalog.packages.length}</strong><small>Kelola paket <UiIcon /></small></button><button type="button" on:click={() => changeView('destinations')}><span>Destinasi</span><strong>{catalog.destinations.length}</strong><small>Kelola destinasi <UiIcon /></small></button></div>
        <div class="admin-overview-grid"><section class="admin-recent"><div class="admin-section-heading"><h3>Permintaan terbaru</h3><button class="admin-text-button" type="button" on:click={() => changeView('bookings')}>Lihat semua</button></div>{#if bookings.length}{#each bookings.slice(0, 3) as item}<article><small>{item.code} · {new Date(item.created_at).toLocaleDateString('id-ID')}</small><h4>{item.service_name}</h4><p>{new Date(item.travel_date).toLocaleDateString('id-ID')} · {item.people} peserta</p><span class="admin-status">{item.status}</span></article>{/each}<button class="admin-secondary" type="button" on:click={() => changeView('bookings')}>Periksa pemesanan <UiIcon /></button>{:else}<p>Belum ada permintaan pelanggan. Pemesanan baru akan muncul otomatis di sini.</p>{/if}</section>
        <section class="admin-shortcuts"><h3 id="admin-overview-title">Apa yang ingin kamu kelola?</h3>
        <div class="admin-task-list" aria-label="Pintasan pengelolaan">
          <button type="button" on:click={() => changeView('packages')}><span><b>Paket wisata</b><small>Nama, harga, itinerary, dan gambar paket</small></span><UiIcon /></button>
          <button type="button" on:click={() => changeView('destinations')}><span><b>Destinasi</b><small>Tempat wisata dan galeri foto</small></span><UiIcon /></button>
          <button type="button" on:click={() => changeView('travel')}><span><b>Tarif Jasa Travel</b><small>Harga per kilometer perjalanan</small></span><UiIcon /></button>
          <button type="button" on:click={() => changeView('settings')}><span><b>Website dan kontak</b><small>Halaman utama, WhatsApp, warna, dan media sosial</small></span><UiIcon /></button>
        </div>
        </section></div>
        <div class="admin-notice"><strong>Tentang bahasa</strong><span>Isi konten cukup dalam bahasa Indonesia. Pengunjung dapat memilih bahasa melalui menu terjemahan di website publik.</span></div>
      </section>
    {:else if active === 'bookings'}
      <section class="admin-section" aria-labelledby="admin-bookings-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Permintaan pelanggan</p><h3 id="admin-bookings-title">Pemesanan masuk</h3></div><div class="admin-heading-actions"><a class="admin-secondary" href="/api/admin/bookings/export">Unduh CSV</a><button class="admin-secondary" type="button" on:click={() => refreshBookings()} disabled={bookingsLoading || Boolean(statusSavingId) || Boolean(deletingBookingId)}>{bookingsLoading ? 'Memuat…' : 'Muat ulang'}</button></div></div>
        {#if bookings.length}
          <p class="admin-results-note">{bookings.length} pemesanan ditampilkan{bookingsCursor ? ' · data lebih lama masih tersedia' : ' · semua data sudah dimuat'}.</p>
          <div class="booking-admin-list">{#each bookings as item}{@const itinerary = bookingItinerary(item)}<article>
            <div class="booking-code"><b>{item.code}</b><span>{new Date(item.created_at).toLocaleString('id-ID')}</span></div>
            <div class="booking-summary"><h4>{item.service_name}</h4><p><b>{item.customer_name}</b><span>Tanggal perjalanan: {new Date(item.travel_date).toLocaleDateString('id-ID')}</span><span>Jumlah tamu: {item.people} orang</span></p>
              {#if item.service_type === 'travel' && item.details}
                <dl class="booking-details">
                  <div><dt>Jam jemput</dt><dd>{item.details.pickupTime || '—'}</dd></div>
                  <div><dt>Jarak</dt><dd>{item.details.distanceKm ? `${item.details.distanceKm} km` : '—'}</dd></div>
                  <div><dt>Durasi</dt><dd>{item.details.durationMinutes ? `${item.details.durationMinutes} menit` : '—'}</dd></div>
                  <div><dt>Estimasi biaya</dt><dd>{formatCurrency(item.details.estimatedPrice) || '—'}</dd></div>
                  {#if item.details.notes}<div class="booking-detail-wide"><dt>Catatan</dt><dd>{item.details.notes}</dd></div>{/if}
                </dl>
              {:else if item.details?.notes}
                <p class="booking-detail-notes"><b>Catatan:</b> {item.details.notes}</p>
              {/if}
              {#if itinerary.length}<ol class="booking-itinerary" aria-label="Rute perjalanan">{#each itinerary as stop}<li><span>{stop.label}</span><b>{stop.name}</b></li>{/each}</ol>{/if}
            </div>
            <div class="booking-actions"><a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Hubungi pelanggan</a><label><span>Status pesanan</span><select value={item.status} on:change={(event) => setBookingStatus(item, event.currentTarget.value, event.currentTarget)} disabled={Boolean(statusSavingId) || Boolean(deletingBookingId)} aria-busy={statusSavingId === item.id} aria-label="Status {item.code}"><option value="baru">Baru</option><option value="dikonfirmasi">Dikonfirmasi</option><option value="selesai">Selesai</option><option value="dibatalkan">Dibatalkan</option></select></label><button class="booking-delete" type="button" on:click={() => deleteBookingRecord(item)} disabled={Boolean(deletingBookingId) || Boolean(statusSavingId)} aria-label="Hapus pemesanan {item.code}">{deletingBookingId === item.id ? 'Menghapus…' : 'Hapus'}</button></div>
          </article>{/each}</div>
          {#if bookingsCursor}<div class="admin-load-more"><button class="admin-secondary" type="button" on:click={() => refreshBookings(false, true)} disabled={bookingsLoading || Boolean(statusSavingId) || Boolean(deletingBookingId)}>{bookingsLoading ? 'Memuat…' : 'Muat pemesanan lebih lama'}</button></div>{/if}
        {:else}<div class="admin-empty"><strong>Belum ada pemesanan</strong><p>Pesanan yang dibuat pelanggan akan muncul otomatis di halaman ini.</p></div>{/if}
      </section>
    {:else if active === 'packages'}
      <section class="admin-section" aria-labelledby="admin-packages-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Katalog</p><h3 id="admin-packages-title">Paket Wisata</h3></div><button class="admin-secondary" on:click={addPackage}>Tambah paket</button></div>
        {#if !packageEditorOpen}<div class="admin-catalog-table"><table><caption class="sr-only">Daftar paket wisata</caption><thead><tr><th>Paket wisata</th><th>Durasi</th><th>Harga mulai</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>{#each catalog.packages as item, index}<tr><td><div class="admin-row-identity">{#if item.image}<img src={item.image} alt="" loading="lazy" width="72" height="54" />{/if}<span><b>{item.name}</b><small>{item.category}</small></span></div></td><td data-label="Durasi">{item.duration}</td><td data-label="Harga mulai"><b>{item.price}</b><small>{item.unit}</small></td><td><button class="admin-secondary" type="button" on:click={() => openEditor('packages', index)} aria-label={`Edit paket ${item.name}`}>Edit paket <UiIcon /></button></td></tr>{/each}</tbody></table>{#if !catalog.packages.length}<div class="admin-empty"><strong>Belum ada paket wisata</strong><p>Tambahkan paket untuk mulai mengisi katalog.</p></div>{/if}</div>
        {:else}<div class="admin-catalog-workspace">
        <div class="admin-editor-list">
          {#each catalog.packages as item, index}
            {#if index === Math.min(selectedPackage, catalog.packages.length - 1)}
            <details class="admin-editor-card" class:selected={index === Math.min(selectedPackage, catalog.packages.length - 1)} open={index === Math.min(selectedPackage, catalog.packages.length - 1)}>
              <summary class="admin-editor-summary"><span class="admin-card-number">{String(index + 1).padStart(2, '0')}</span>{#if item.image}<img src={item.image} alt="" />{/if}<span class="admin-item-summary"><b>{item.name}</b><small>{item.duration} · {item.price}</small></span><span class="admin-editor-toggle">Edit</span></summary>
              <div class="admin-editor-body"><div class="admin-fields"><section class="admin-form-panel" id="package-info"><h4>Informasi utama</h4>
                <details class="admin-advanced"><summary>Pengaturan alamat halaman</summary><label><span>Alamat halaman</span><input value={item.slug} on:input={(event) => updatePackage(index, 'slug', slugify(event.currentTarget.value))} /><small>Biasanya tidak perlu diubah setelah paket dipublikasikan.</small></label></details>
                <div class="admin-field-row"><label><span>Durasi</span><input value={item.duration} on:input={(event) => updatePackage(index, 'duration', event.currentTarget.value)} placeholder="Contoh: 2 hari 1 malam" /></label><label><span>Kategori</span><input value={item.category} on:input={(event) => updatePackage(index, 'category', event.currentTarget.value)} placeholder="Contoh: Private tour" /></label></div>
                <label><span>Nama paket</span><input value={item.name} on:input={(event) => updatePackage(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Destinasi dan aktivitas</span><textarea rows="2" value={item.route} on:input={(event) => updatePackage(index, 'route', event.currentTarget.value)}></textarea></label>
                <fieldset class="admin-subsection admin-destination-picker"><legend>Destinasi dalam paket</legend><p>Pilih destinasi yang benar-benar dikunjungi. Paket ini akan otomatis tampil pada halaman destinasi yang dipilih.</p>{#if catalog.destinations.length}<div class="admin-checkbox-list">{#each catalog.destinations as destination}<label class:selected={(item.destinationSlugs || []).includes(destination.slug)}><input type="checkbox" checked={(item.destinationSlugs || []).includes(destination.slug)} on:change={(event) => setPackageDestination(index, destination.slug, event.currentTarget.checked)} /><span><strong>{destination.name}</strong><small>{destination.note}</small></span></label>{/each}</div>{:else}<p class="admin-inline-empty">Belum ada destinasi. Tambahkan destinasi terlebih dahulu.</p>{/if}</fieldset>
                <RichTextEditor label="Deskripsi paket" bind:value={item.detail} />
                </section><section class="admin-form-panel" id="package-pricing"><h4>Harga dan jumlah tamu</h4>
                <div class="admin-field-row"><label><span>Harga</span><input value={item.price} on:input={(event) => updatePackage(index, 'price', event.currentTarget.value)} /></label><label><span>Satuan</span><input value={item.unit} on:input={(event) => updatePackage(index, 'unit', event.currentTarget.value)} /></label></div>
                <fieldset class="admin-subsection"><legend>Harga berdasarkan jumlah tamu</legend>{#each item.priceTiers || [] as tier, tierIndex}<div class="admin-price-tier"><input aria-label="Jumlah tamu" value={tier.guests} on:input={(event) => updatePriceTier(index, tierIndex, 'guests', event.currentTarget.value)} /><input aria-label="Harga" value={tier.price} on:input={(event) => updatePriceTier(index, tierIndex, 'price', event.currentTarget.value)} /><input aria-label="Keterangan" value={tier.note} on:input={(event) => updatePriceTier(index, tierIndex, 'note', event.currentTarget.value)} /><button type="button" on:click={() => removePriceTier(index, tierIndex)}>Hapus</button></div>{/each}<button class="admin-secondary compact" type="button" on:click={() => addPriceTier(index)}>Tambah pilihan harga</button></fieldset>
                </section>
                <details class="admin-translation"><summary>Terjemahan English (opsional)</summary><div class="admin-fields">
                  <p class="admin-inline-empty">Dipakai di halaman berbahasa Inggris. Kosongkan untuk memakai konten Indonesia di atas.</p>
                  <div class="admin-field-row"><label><span>Durasi (English)</span><input value={item.durationEn || ''} on:input={(event) => updatePackage(index, 'durationEn', event.currentTarget.value)} placeholder="Example: 2 days 1 night" /></label><label><span>Kategori (English)</span><input value={item.categoryEn || ''} on:input={(event) => updatePackage(index, 'categoryEn', event.currentTarget.value)} placeholder="Example: Private tour" /></label></div>
                  <label><span>Nama paket (English)</span><input value={item.nameEn || ''} on:input={(event) => updatePackage(index, 'nameEn', event.currentTarget.value)} /></label>
                  <label><span>Destinasi dan aktivitas (English)</span><textarea rows="2" value={item.routeEn || ''} on:input={(event) => updatePackage(index, 'routeEn', event.currentTarget.value)}></textarea></label>
                  <RichTextEditor label="Deskripsi paket (English)" bind:value={item.detailEn} />
                  <label><span>Satuan (English)</span><input value={item.unitEn || ''} on:input={(event) => updatePackage(index, 'unitEn', event.currentTarget.value)} placeholder="Example: per person" /></label>
                  <label><span>Itinerary (English)</span><textarea rows="8" value={itineraryText(item.itineraryEn)} on:change={(event) => updateItineraryEn(index, event.currentTarget.value)}></textarea><small>Baris pertama adalah judul hari, baris berikutnya aktivitas. Pisahkan setiap hari dengan satu baris kosong.</small></label>
                  <div class="admin-field-row"><label><span>Sudah termasuk (English)</span><textarea rows="5" value={(item.includesEn || []).join('\n')} on:change={(event) => updateLines(index, 'includesEn', event.currentTarget.value)}></textarea><small>Satu fasilitas per baris.</small></label><label><span>Belum termasuk (English)</span><textarea rows="5" value={(item.excludesEn || []).join('\n')} on:change={(event) => updateLines(index, 'excludesEn', event.currentTarget.value)}></textarea><small>Satu item per baris.</small></label></div>
                  <fieldset class="admin-subsection"><legend>Harga berdasarkan jumlah tamu (English)</legend><p class="admin-inline-empty">Harga tetap memakai nilai pada bagian harga di atas.</p>{#each item.priceTiers || [] as tier, tierIndex}<div class="admin-price-tier"><input aria-label="Jumlah tamu (English)" value={tier.guestsEn || ''} on:input={(event) => updatePriceTier(index, tierIndex, 'guestsEn', event.currentTarget.value)} /><input aria-label="Harga" value={tier.price} readonly /><input aria-label="Keterangan (English)" value={tier.noteEn || ''} on:input={(event) => updatePriceTier(index, tierIndex, 'noteEn', event.currentTarget.value)} /></div>{/each}</fieldset>
                </div></details>
                <section class="admin-form-panel" id="package-itinerary"><h4>Itinerary dan fasilitas</h4>
                <label><span>Itinerary Indonesia</span><textarea rows="8" value={itineraryText(item.itinerary)} on:change={(event) => updateItinerary(index, event.currentTarget.value)}></textarea><small>Baris pertama adalah judul hari, baris berikutnya aktivitas. Pisahkan setiap hari dengan satu baris kosong.</small></label>
                <div class="admin-field-row"><label><span>Sudah termasuk</span><textarea rows="5" value={(item.includes || []).join('\n')} on:change={(event) => updateLines(index, 'includes', event.currentTarget.value)}></textarea><small>Satu fasilitas per baris.</small></label><label><span>Belum termasuk</span><textarea rows="5" value={(item.excludes || []).join('\n')} on:change={(event) => updateLines(index, 'excludes', event.currentTarget.value)}></textarea><small>Satu item per baris.</small></label></div>
                </section>
                <section class="admin-form-panel" id="package-gallery"><h4>Galeri foto</h4>
                {#if item.image}<div class="admin-image-preview"><img src={item.image} alt="Pratinjau {item.name}" /><span><strong>Gambar utama saat ini</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage(`gambar utama ${item.name}`, (value) => updatePackage(index, 'image', value))} aria-label="Hapus gambar utama {item.name}"><TrashIcon /></button></div>{/if}
                <label><span>Upload gambar utama</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'image', url), `package-${index}`, event.currentTarget)} /><small>{uploading === `package-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 4 MB.'}</small></label>
                {#if item.images?.length}<div class="admin-gallery-preview">{#each item.images as image, imageIndex}<figure><img src={image} alt="Galeri {item.name} {imageIndex + 1}" /><button class="admin-image-trash" type="button" on:click={() => removeGalleryImage(item.images, imageIndex, (images) => updatePackage(index, 'images', images))} aria-label="Hapus gambar galeri {imageIndex + 1} dari {item.name}"><TrashIcon /></button></figure>{/each}</div>{/if}
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'images', [...(item.images || []), url]), `gallery-${index}`, event.currentTarget)} /><small>{uploading === `gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri.'}</small></label>
                </section>
              </div><button class="admin-delete" on:click={() => removePackage(index)} aria-label="Hapus paket {item.name}"><TrashIcon />Hapus paket</button></div>
            </details>
            {/if}
          {/each}
        </div><aside class="admin-preview-rail" aria-label="Pratinjau paket">{#if selectedObject}<h3>Pratinjau singkat</h3>{#if selectedObject.image}<img src={selectedObject.image} alt="" width="360" height="270" />{/if}<h4>{selectedObject.name}</h4><p>{selectedObject.duration}</p><strong>{selectedObject.price}</strong><small>{selectedObject.unit}</small><nav aria-label="Bagian editor paket"><a href="#package-info">Informasi utama</a><a href="#package-pricing">Harga dan peserta</a><a href="#package-itinerary">Itinerary dan fasilitas</a><a href="#package-gallery">Galeri foto</a></nav>{/if}</aside></div>{/if}
      </section>
    {:else if active === 'destinations'}
      <section class="admin-section" aria-labelledby="admin-destinations-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Inspirasi perjalanan</p><h3 id="admin-destinations-title">Destinasi</h3></div><button class="admin-secondary" on:click={addDestination}>Tambah destinasi</button></div>
        {#if !destinationEditorOpen}<div class="admin-catalog-table"><table><caption class="sr-only">Daftar destinasi</caption><thead><tr><th>Destinasi</th><th>Keterangan</th><th>Paket terkait</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>{#each catalog.destinations as item, index}<tr><td><div class="admin-row-identity">{#if item.image}<img src={item.image} alt="" loading="lazy" width="72" height="54" />{/if}<b>{item.name}</b></div></td><td>{item.note}</td><td data-label="Paket terkait">{catalog.packages.filter(pack => (pack.destinationSlugs || []).includes(item.slug)).length} paket</td><td><button class="admin-secondary" type="button" on:click={() => openEditor('destinations', index)} aria-label={`Edit destinasi ${item.name}`}>Edit destinasi <UiIcon /></button></td></tr>{/each}</tbody></table>{#if !catalog.destinations.length}<div class="admin-empty"><strong>Belum ada destinasi</strong><p>Tambahkan tempat wisata yang ingin ditampilkan.</p></div>{/if}</div>
        {:else}<div class="admin-catalog-workspace">
        <div class="admin-editor-list">
          {#each catalog.destinations as item, index}
            {#if index === Math.min(selectedDestination, catalog.destinations.length - 1)}
            <details class="admin-editor-card" class:selected={index === Math.min(selectedDestination, catalog.destinations.length - 1)} open={index === Math.min(selectedDestination, catalog.destinations.length - 1)}>
              <summary class="admin-editor-summary"><span class="admin-card-number">{String(index + 1).padStart(2, '0')}</span>{#if item.image}<img src={item.image} alt="" />{/if}<span class="admin-item-summary"><b>{item.name}</b><small>{item.note}</small></span><span class="admin-editor-toggle">Edit</span></summary>
              <div class="admin-editor-body"><div class="admin-fields"><section class="admin-form-panel" id="destination-info"><h4>Informasi destinasi</h4>
                <label><span>Nama destinasi</span><input value={item.name} on:input={(event) => updateDestination(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Keterangan singkat</span><input value={item.note} on:input={(event) => updateDestination(index, 'note', event.currentTarget.value)} /></label>
                <RichTextEditor label="Deskripsi destinasi" bind:value={item.detail} />
                </section>
                <details class="admin-translation"><summary>Terjemahan English (opsional)</summary><div class="admin-fields">
                  <p class="admin-inline-empty">Dipakai di halaman berbahasa Inggris. Kosongkan untuk memakai konten Indonesia di atas.</p>
                  <label><span>Nama destinasi (English)</span><input value={item.nameEn || ''} on:input={(event) => updateDestination(index, 'nameEn', event.currentTarget.value)} /></label>
                  <label><span>Keterangan singkat (English)</span><input value={item.noteEn || ''} on:input={(event) => updateDestination(index, 'noteEn', event.currentTarget.value)} /></label>
                  <RichTextEditor label="Deskripsi destinasi (English)" bind:value={item.detailEn} />
                </div></details>
                <section class="admin-form-panel" id="destination-related"><h4>Paket terkait</h4><fieldset class="admin-subsection admin-destination-picker"><legend>Paket untuk destinasi ini</legend><p>Centang paket yang ingin ditampilkan pada halaman {item.name}.</p>{#if catalog.packages.length}<div class="admin-checkbox-list">{#each catalog.packages as packageItem, packageIndex}<label class:selected={(packageItem.destinationSlugs || []).includes(item.slug)}><input type="checkbox" checked={(packageItem.destinationSlugs || []).includes(item.slug)} on:change={(event) => setPackageDestination(packageIndex, item.slug, event.currentTarget.checked)} /><span><strong>{packageItem.name}</strong><small>{packageItem.duration} · {packageItem.price}</small></span></label>{/each}</div>{:else}<p class="admin-inline-empty">Belum ada paket wisata.</p>{/if}</fieldset></section>
                <section class="admin-form-panel" id="destination-gallery"><h4>Galeri foto</h4>
                {#if item.image}<div class="admin-image-preview"><img src={item.image} alt="Pratinjau {item.name}" /><span><strong>Gambar utama saat ini</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage(`gambar utama ${item.name}`, (value) => updateDestination(index, 'image', value))} aria-label="Hapus gambar utama {item.name}"><TrashIcon /></button></div>{/if}
                <label><span>Upload gambar</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'image', url), `destination-${index}`, event.currentTarget)} /><small>{uploading === `destination-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 4 MB.'}</small></label>
                {#if item.images?.length}<div class="admin-gallery-preview">{#each item.images as image, imageIndex}<figure><img src={image} alt="Galeri {item.name} {imageIndex + 1}" /><button class="admin-image-trash" type="button" on:click={() => removeGalleryImage(item.images, imageIndex, (images) => updateDestination(index, 'images', images))} aria-label="Hapus gambar galeri {imageIndex + 1} dari {item.name}"><TrashIcon /></button></figure>{/each}</div>{/if}
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'images', [...(item.images || []), url]), `destination-gallery-${index}`, event.currentTarget)} /><small>{uploading === `destination-gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri destinasi.'}</small></label>
                </section>
              </div><button class="admin-delete" on:click={() => removeDestination(index)} aria-label="Hapus destinasi {item.name}"><TrashIcon />Hapus destinasi</button></div>
            </details>
            {/if}
          {/each}
        </div><aside class="admin-preview-rail" aria-label="Pratinjau destinasi">{#if selectedObject}<h3>Pratinjau singkat</h3>{#if selectedObject.image}<img src={selectedObject.image} alt="" width="360" height="270" />{/if}<h4>{selectedObject.name}</h4><p>{selectedObject.note}</p><nav aria-label="Bagian editor destinasi"><a href="#destination-info">Informasi destinasi</a><a href="#destination-related">Paket terkait</a><a href="#destination-gallery">Galeri foto</a></nav>{/if}</aside></div>{/if}
      </section>
    {:else if active === 'travel'}
      <section class="admin-section admin-narrow" aria-labelledby="admin-travel-title">
        <p class="admin-kicker">Tarif perjalanan</p><h3 id="admin-travel-title">Paket Travel</h3>
        <p class="admin-description">Tarif diterapkan pada setiap kilometer rute jalan yang dihitung di halaman pemesanan.</p>
        <label class="admin-rate"><span>Tarif per kilometer</span><div><b>Rp</b><input type="number" min="1000" step="1000" bind:value={catalog.travelRate} /><em>/ km</em></div></label>
        <div class="admin-rate-example"><strong>Contoh perhitungan</strong><p>Rute 47 km × {formatCurrency(catalog.travelRate)} = <b>{formatCurrency(47 * catalog.travelRate)}</b></p><small>Ilustrasi biaya, bukan rute atau penawaran aktual. Harga akhir dikonfirmasi sesuai perjalanan pelanggan.</small></div>
      </section>
    {:else if active === 'rentals'}
      <section class="admin-section" aria-labelledby="admin-rentals-title">
        <p class="admin-kicker">Katalog kendaraan</p><h3 id="admin-rentals-title">Rental</h3>
        <div class="admin-editor-list">
          {#each catalog.rentals as item, index}
            <article class="admin-editor-card rental-editor">
              <div class="admin-card-number">{item.symbol}</div>
              <div class="admin-fields"><label><span>Nama layanan</span><input value={item.name} on:input={(event) => updateRental(index, 'name', event.currentTarget.value)} /></label><RichTextEditor label="Keterangan layanan" bind:value={item.detail} /><label><span>Harga yang ditampilkan</span><input value={item.price} on:input={(event) => updateRental(index, 'price', event.currentTarget.value)} /></label>
                <details class="admin-translation"><summary>Terjemahan English (opsional)</summary><div class="admin-fields">
                  <p class="admin-inline-empty">Dipakai di halaman berbahasa Inggris. Kosongkan untuk memakai konten Indonesia di atas.</p>
                  <label><span>Nama layanan (English)</span><input value={item.nameEn || ''} on:input={(event) => updateRental(index, 'nameEn', event.currentTarget.value)} /></label>
                  <RichTextEditor label="Keterangan layanan (English)" bind:value={item.detailEn} />
                  <label><span>Harga yang ditampilkan (English)</span><input value={item.priceEn || ''} on:input={(event) => updateRental(index, 'priceEn', event.currentTarget.value)} /></label>
                </div></details>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {:else if active === 'faqs'}
      <section class="admin-section" aria-labelledby="admin-faqs-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Konten bantuan</p><h3 id="admin-faqs-title">Pertanyaan Umum</h3></div><button class="admin-secondary" on:click={addFaq}>Tambah pertanyaan</button></div>
        <p class="admin-description">Pertanyaan ditampilkan di website publik sesuai urutan pada daftar ini.</p>
        <div class="admin-editor-list">
          {#each catalog.faqs as item, index}
            <details class="admin-editor-card">
              <summary class="admin-editor-summary"><span class="admin-card-number">{String(index + 1).padStart(2, '0')}</span><span class="admin-item-summary"><b>{item.question}</b><small>Klik untuk mengubah jawaban</small></span><span class="admin-editor-toggle">Edit</span></summary>
              <div class="admin-editor-body"><div class="admin-fields">
                <label><span>Pertanyaan</span><input maxlength="200" value={item.question} on:input={(event) => updateFaq(index, 'question', event.currentTarget.value)} /></label>
                <RichTextEditor label="Jawaban" bind:value={item.answer} />
                <details class="admin-translation"><summary>Terjemahan English (opsional)</summary><div class="admin-fields">
                  <p class="admin-inline-empty">Dipakai di halaman berbahasa Inggris. Kosongkan untuk memakai konten Indonesia di atas.</p>
                  <label><span>Pertanyaan (English)</span><input maxlength="200" value={item.questionEn || ''} on:input={(event) => updateFaq(index, 'questionEn', event.currentTarget.value)} /></label>
                  <RichTextEditor label="Jawaban (English)" bind:value={item.answerEn} />
                </div></details>

              </div><button class="admin-delete" on:click={() => removeFaq(index)} aria-label="Hapus pertanyaan {item.question}">Hapus pertanyaan</button></div>
            </details>
          {/each}
        </div>
      </section>
    {:else}
      <section class="admin-section" aria-labelledby="admin-settings-title">
        <p class="admin-kicker">Konten publik</p><h3 id="admin-settings-title">Informasi Website</h3>
        <p class="admin-description">Isi bagian yang ingin ditampilkan kepada pengunjung. Kosongkan tautan media sosial jika belum digunakan.</p>
        <div class="admin-settings-grid">
          <div class="admin-settings-column">
          <fieldset><legend>Kontak</legend>
            <label><span>Nomor WhatsApp</span><input bind:value={catalog.settings.whatsapp} inputmode="tel" placeholder="Contoh: 628123456789" /><small>Gunakan kode negara 62. Nomor ini dipakai semua tombol pemesanan.</small></label>
            <label><span>Email</span><input bind:value={catalog.settings.email} type="email" placeholder="hello@contoh.com" /></label>
            <label><span>Lokasi</span><input bind:value={catalog.settings.location} placeholder="Lombok, Nusa Tenggara Barat" /></label>
          </fieldset>
          <fieldset><legend>Media sosial</legend>
            <label><span>URL Instagram</span><input bind:value={catalog.settings.instagram} type="url" placeholder="https://instagram.com/..." /></label>
            <label><span>URL TikTok</span><input bind:value={catalog.settings.tiktok} type="url" placeholder="https://tiktok.com/@..." /></label>
            <label><span>URL Facebook</span><input bind:value={catalog.settings.facebook} type="url" placeholder="https://facebook.com/..." /></label>
          </fieldset>
          </div><div class="admin-settings-column">
          <fieldset><legend>Halaman utama</legend>
            <label><span>Palet warna website</span><select bind:value={catalog.settings.colorTheme}><option value="classic">Klasik: hijau dan emas</option><option value="ocean">Laut Lombok: navy dan teal</option></select><small>Pratinjau langsung terlihat di admin. Simpan untuk menerapkannya ke website publik.</small></label>
            <label><span>Judul utama</span><textarea rows="2" bind:value={catalog.settings.heroTitle}></textarea></label>
            <RichTextEditor label="Deskripsi utama" bind:value={catalog.settings.heroDescription} />
            {#if catalog.settings.heroImage}<div class="admin-image-preview"><img src={catalog.settings.heroImage} alt="Pratinjau gambar latar bagian atas" /><span><strong>Background bagian atas</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage('gambar latar bagian atas', (value) => { catalog.settings.heroImage = value; catalog = { ...catalog }; })} aria-label="Hapus gambar latar bagian atas"><TrashIcon /></button></div>{/if}
            <label><span>Upload gambar latar bagian atas</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => { catalog.settings.heroImage = url; catalog = { ...catalog }; }, 'hero-background', event.currentTarget)} /><small>{uploading === 'hero-background' ? 'Mengunggah…' : 'Gambar landscape disarankan. Maksimal 4 MB.'}</small></label>
          </fieldset><fieldset><legend>Profil Wonderful Lombok</legend>
            <label><span>Judul bagian profil</span><textarea rows="2" bind:value={catalog.settings.aboutTitle}></textarea></label>
            <RichTextEditor label="Deskripsi profil" bind:value={catalog.settings.aboutDescription} />
            {#if catalog.settings.aboutImage}<div class="admin-image-preview"><img src={catalog.settings.aboutImage} alt="Pratinjau gambar bagian profil" /><span><strong>Gambar Mengapa Wonderful Lombok</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage('gambar bagian profil', (value) => { catalog.settings.aboutImage = value; catalog = { ...catalog }; })} aria-label="Hapus gambar bagian profil"><TrashIcon /></button></div>{/if}
            <label><span>Upload gambar bagian profil</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => { catalog.settings.aboutImage = url; catalog = { ...catalog }; }, 'about-background', event.currentTarget)} /><small>{uploading === 'about-background' ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 4 MB.'}</small></label>
            <details class="admin-translation"><summary>Terjemahan English (opsional)</summary><div class="admin-fields">
              <p class="admin-inline-empty">Dipakai di halaman berbahasa Inggris. Kosongkan untuk memakai konten Indonesia di atas.</p>
              <label><span>Judul utama (English)</span><textarea rows="2" bind:value={catalog.settings.heroTitleEn}></textarea></label>
              <RichTextEditor label="Deskripsi utama (English)" bind:value={catalog.settings.heroDescriptionEn} />
              <label><span>Judul bagian profil (English)</span><textarea rows="2" bind:value={catalog.settings.aboutTitleEn}></textarea></label>
              <RichTextEditor label="Deskripsi profil (English)" bind:value={catalog.settings.aboutDescriptionEn} />
            </div></details>
          </fieldset>
          </div>
        </div>
      </section>
    {/if}
  </main>
</div>
