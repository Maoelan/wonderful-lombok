<script>
  import { onMount } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { slugify } from '#lib/i18n.js';
  import { createUnsavedChangesGuard } from '#lib/unsaved-changes.js';
  import RichTextEditor from '#lib/RichTextEditor.svelte';
  import TrashIcon from '#lib/TrashIcon.svelte';
  export let data;
  let catalog = structuredClone(data.catalog);
  let catalogRevision = data.catalogRevision ?? 0;
  let bookings = data.bookings;
  let active = 'overview';
  let saved = false;
  let dirty = false;
  let saving = false;
  let editVersion = 0;
  let saveError = '';
  let uploading = '';
  let bookingsLoading = false;

  const leaveGuard = createUnsavedChangesGuard({
    isDirty: () => dirty,
    confirmLeave: () => window.confirm('Ada perubahan yang belum disimpan. Tinggalkan halaman admin?')
  });
  beforeNavigate(leaveGuard.beforeNavigate);

  $: newBookings = bookings.filter((item) => item.status === 'baru');
  $: pageInfo = ({
    overview: ['Ringkasan', 'Pilih pekerjaan yang ingin dilakukan hari ini.'],
    bookings: ['Pemesanan', 'Periksa permintaan pelanggan dan perbarui statusnya.'],
    packages: ['Paket wisata', 'Tambah atau perbarui paket yang tampil di website.'],
    destinations: ['Destinasi', 'Kelola inspirasi tempat yang dapat dikunjungi pelanggan.'],
    travel: ['Paket travel', 'Atur tarif perjalanan berdasarkan jarak.'],
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

  async function refreshBookings(silent = false) {
    if (!silent) bookingsLoading = true;
    try {
      const response = await fetch('/api/admin/bookings');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pemesanan gagal dimuat.');
      bookings = result.bookings;
    } catch (error) {
      if (!silent) saveError = error.message;
    } finally {
      bookingsLoading = false;
    }
  }

  async function persist() {
    if (saving) return;
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
    if (event?.target?.closest('.booking-admin-list')) return;
    dirty = true;
    saved = false;
    editVersion += 1;
  }

  function updateRental(index, field, value) {
    catalog.rentals[index][field] = value;
    catalog = { ...catalog };
  }

  function addPackage() {
    const name = 'Paket baru';
    catalog.packages = [...catalog.packages, { slug: `${slugify(name)}-${catalog.packages.length + 1}`, category: 'Private tour', duration: '1 hari', name, route: 'Isi destinasi paket', detail: 'Isi detail paket', price: 'Rp0', unit: 'per orang', image: '', images: [], destinationSlugs: [], itinerary: [{ day: 'Hari 1', title: 'Judul perjalanan', items: ['Aktivitas pertama'] }], includes: ['Transportasi'], excludes: ['Pengeluaran pribadi'], priceTiers: [{ guests: '1–2 orang', price: 'Rp0', note: 'per orang' }] }];
    catalog = { ...catalog };
    markDirty();
  }

  function updateLines(index, field, value) { updatePackage(index, field, value.split('\n').map((line) => line.trim()).filter(Boolean)); }
  function updateItinerary(index, value) {
    updatePackage(index, 'itinerary', value.split('\n\n').map((block, dayIndex) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      return { day: `Hari ${dayIndex + 1}`, title: lines[0] || '', items: lines.slice(1) };
    }).filter((day) => day.title));
  }
  function itineraryText(days) { return (days || []).map((day) => [day.title, ...(day.items || [])].join('\n')).join('\n\n'); }
  function addPriceTier(index) { updatePackage(index, 'priceTiers', [...(catalog.packages[index].priceTiers || []), { guests: '1 orang', guestsEn: '1 guest', price: 'Rp0', note: 'per orang', noteEn: 'per person' }]); markDirty(); }
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
    catalog.destinations = [...catalog.destinations, { slug: `destinasi-${catalog.destinations.length + 1}`, name: 'Destinasi baru', note: 'Keterangan singkat', detail: 'Isi detail destinasi', image: '', images: [] }];
    catalog = { ...catalog };
    markDirty();
  }

  function removeDestination(index) {
    if (!confirm(`Hapus destinasi ${catalog.destinations[index].name}?`)) return;
    const slug = catalog.destinations[index].slug;
    catalog.destinations = catalog.destinations.filter((_, itemIndex) => itemIndex !== index);
    catalog.packages = catalog.packages.map((item) => ({ ...item, destinationSlugs: (item.destinationSlugs || []).filter((value) => value !== slug) }));
    catalog = { ...catalog };
    markDirty();
  }

  function updateFaq(index, field, value) {
    catalog.faqs[index][field] = value;
    catalog = { ...catalog };
  }

  function addFaq() {
    catalog.faqs = [...catalog.faqs, { question: 'Pertanyaan baru', answer: 'Tulis jawaban yang membantu pelanggan.' }];
    catalog = { ...catalog };
    markDirty();
  }

  function removeFaq(index) {
    if (!confirm(`Hapus pertanyaan “${catalog.faqs[index].question}”?`)) return;
    catalog.faqs = catalog.faqs.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
    markDirty();
  }

  async function uploadImage(file, apply, key) {
    if (!file) return;
    uploading = key;
    saveError = '';
    try {
      const form = new FormData();
      form.set('image', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gambar gagal diunggah.');
      apply(result.url);
      markDirty();
    } catch (error) { saveError = error.message; }
    finally { uploading = ''; }
  }

  function clearImage(label, apply) {
    if (confirm(`Hapus ${label}?`)) { apply(''); markDirty(); }
  }

  function removeGalleryImage(images, imageIndex, apply) {
    if (confirm(`Hapus gambar galeri nomor ${imageIndex + 1}?`)) { apply(images.filter((_, index) => index !== imageIndex)); markDirty(); }
  }

  function removePackage(index) {
    if (!confirm(`Hapus paket ${catalog.packages[index].name}?`)) return;
    catalog.packages = catalog.packages.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
    markDirty();
  }

  async function setBookingStatus(item, status) {
    const response = await fetch(`/api/admin/bookings/${item.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) { saveError = 'Status pemesanan gagal diperbarui.'; return; }
    item.status = status; bookings = [...bookings];
  }
</script>

<svelte:head><title>Admin | Wonderful Lombok</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="admin-shell" class:theme-ocean={catalog.settings.colorTheme === 'ocean'}>
  <aside class="admin-sidebar">
    <a class="admin-brand admin-logo" href="/" aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
    <div><p class="admin-kicker">Pengelolaan website</p><h1>Admin</h1></div>
    <nav aria-label="Menu admin">
      <p>Mulai</p>
      <button class:active={active === 'overview'} on:click={() => active = 'overview'}>Ringkasan</button>
      <button class:active={active === 'bookings'} on:click={() => active = 'bookings'}>Pemesanan {#if newBookings.length}<span>{newBookings.length} baru</span>{/if}</button>
      <p>Isi website</p>
      <button class:active={active === 'packages'} on:click={() => active = 'packages'}>Paket wisata <span>{catalog.packages.length}</span></button>
      <button class:active={active === 'destinations'} on:click={() => active = 'destinations'}>Destinasi <span>{catalog.destinations.length}</span></button>
      <button class:active={active === 'travel'} on:click={() => active = 'travel'}>Paket travel</button>
      <button class:active={active === 'faqs'} on:click={() => active = 'faqs'}>Pertanyaan umum <span>{catalog.faqs.length}</span></button>
      <p>Pengaturan</p>
      <button class:active={active === 'settings'} on:click={() => active = 'settings'}>Website dan kontak</button>
    </nav>
    <a class="admin-site-link" href="/" target="_blank" rel="noreferrer">Buka website publik</a>
    <form class="admin-logout" method="POST" action="/logout"><button type="submit">Keluar dari admin</button></form>
  </aside>

  <main class="admin-main" on:input={markDirty} on:change={markDirty}>
    <header class="admin-header">
      <div><p class="admin-kicker">Wonderful Lombok</p><h2>{pageInfo[0]}</h2><p>{pageInfo[1]}</p></div>
      <div class="admin-actions"><span class:saved aria-live="polite">{saved ? 'Perubahan tersimpan' : dirty ? 'Ada perubahan belum disimpan' : 'Semua sudah tersimpan'}</span><button class="admin-save" on:click={persist} disabled={!dirty || saving} aria-busy={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
    </header>

    {#if saveError}<p class="admin-error" role="alert">{saveError}</p>{/if}

    {#if active === 'overview'}
      <section class="admin-section admin-overview" aria-labelledby="admin-overview-title">
        <div class="admin-welcome"><div><p class="admin-kicker">Selamat datang, {data.user.username}</p><h3 id="admin-overview-title">Apa yang ingin kamu kelola?</h3><p>Pilih satu pekerjaan. Perubahan konten baru tampil di website setelah tombol simpan ditekan.</p></div><a href="/" target="_blank" rel="noreferrer">Lihat website</a></div>
        <div class="admin-priority">
          <div><span>Pemesanan baru</span><strong>{newBookings.length}</strong><p>{newBookings.length ? 'Ada pelanggan yang menunggu untuk diperiksa.' : 'Belum ada pesanan baru.'}</p></div>
          <button type="button" on:click={() => active = 'bookings'}>{newBookings.length ? 'Periksa pemesanan' : 'Buka daftar pemesanan'}</button>
        </div>
        <div class="admin-task-list" aria-label="Pintasan pengelolaan">
          <button type="button" on:click={() => active = 'packages'}><span><b>Paket wisata</b><small>Nama, harga, itinerary, dan gambar paket</small></span><strong>{catalog.packages.length} paket</strong></button>
          <button type="button" on:click={() => active = 'destinations'}><span><b>Destinasi</b><small>Tempat wisata dan galeri foto</small></span><strong>{catalog.destinations.length} destinasi</strong></button>
          <button type="button" on:click={() => active = 'faqs'}><span><b>Pertanyaan umum</b><small>Jawaban yang membantu pelanggan</small></span><strong>{catalog.faqs.length} pertanyaan</strong></button>
          <button type="button" on:click={() => active = 'settings'}><span><b>Website dan kontak</b><small>Halaman utama, WhatsApp, warna, dan media sosial</small></span><strong>Atur</strong></button>
        </div>
        <div class="admin-notice"><strong>Tentang bahasa</strong><span>Isi konten cukup dalam bahasa Indonesia. Pengunjung dapat memilih bahasa melalui menu terjemahan di website publik.</span></div>
      </section>
    {:else if active === 'bookings'}
      <section class="admin-section" aria-labelledby="admin-bookings-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Permintaan pelanggan</p><h3 id="admin-bookings-title">Pemesanan masuk</h3></div><button class="admin-secondary" type="button" on:click={() => refreshBookings()} disabled={bookingsLoading}>{bookingsLoading ? 'Memuat…' : 'Muat ulang'}</button></div>
        {#if bookings.length}
          <div class="booking-admin-list">{#each bookings as item}<article>
            <div class="booking-code"><b>{item.code}</b><span>{new Date(item.created_at).toLocaleString('id-ID')}</span></div>
            <div class="booking-summary"><h4>{item.service_name}</h4><p><b>{item.customer_name}</b><span>Tanggal perjalanan: {new Date(item.travel_date).toLocaleDateString('id-ID')}</span><span>Jumlah tamu: {item.people} orang</span></p></div>
            <div class="booking-actions"><a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Hubungi pelanggan</a><label><span>Status pesanan</span><select value={item.status} on:change={(event) => setBookingStatus(item, event.currentTarget.value)} aria-label="Status {item.code}"><option value="baru">Baru</option><option value="dikonfirmasi">Dikonfirmasi</option><option value="selesai">Selesai</option><option value="dibatalkan">Dibatalkan</option></select></label></div>
          </article>{/each}</div>
        {:else}<div class="admin-empty"><strong>Belum ada pemesanan</strong><p>Pesanan yang dibuat pelanggan akan muncul otomatis di halaman ini.</p></div>{/if}
      </section>
    {:else if active === 'packages'}
      <section class="admin-section" aria-labelledby="admin-packages-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Katalog</p><h3 id="admin-packages-title">Paket Wisata</h3></div><button class="admin-secondary" on:click={addPackage}>Tambah paket</button></div>
        <div class="admin-editor-list">
          {#each catalog.packages as item, index}
            <details class="admin-editor-card" open={index === 0}>
              <summary class="admin-editor-summary"><span class="admin-card-number">{String(index + 1).padStart(2, '0')}</span>{#if item.image}<img src={item.image} alt="" />{/if}<span class="admin-item-summary"><b>{item.name}</b><small>{item.duration} · {item.price}</small></span><span class="admin-editor-toggle">Edit</span></summary>
              <div class="admin-editor-body"><div class="admin-fields">
                <details class="admin-advanced"><summary>Pengaturan alamat halaman</summary><label><span>Alamat halaman</span><input value={item.slug} on:input={(event) => updatePackage(index, 'slug', slugify(event.currentTarget.value))} /><small>Biasanya tidak perlu diubah setelah paket dipublikasikan.</small></label></details>
                <div class="admin-field-row"><label><span>Durasi</span><input value={item.duration} on:input={(event) => updatePackage(index, 'duration', event.currentTarget.value)} placeholder="Contoh: 2 hari 1 malam" /></label><label><span>Kategori</span><input value={item.category} on:input={(event) => updatePackage(index, 'category', event.currentTarget.value)} placeholder="Contoh: Private tour" /></label></div>
                <label><span>Nama paket</span><input value={item.name} on:input={(event) => updatePackage(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Destinasi dan aktivitas</span><textarea rows="2" value={item.route} on:input={(event) => updatePackage(index, 'route', event.currentTarget.value)}></textarea></label>
                <fieldset class="admin-subsection admin-destination-picker"><legend>Destinasi dalam paket</legend><p>Pilih destinasi yang benar-benar dikunjungi. Paket ini akan otomatis tampil pada halaman destinasi yang dipilih.</p>{#if catalog.destinations.length}<div class="admin-checkbox-list">{#each catalog.destinations as destination}<label class:selected={(item.destinationSlugs || []).includes(destination.slug)}><input type="checkbox" checked={(item.destinationSlugs || []).includes(destination.slug)} on:change={(event) => setPackageDestination(index, destination.slug, event.currentTarget.checked)} /><span><strong>{destination.name}</strong><small>{destination.note}</small></span></label>{/each}</div>{:else}<p class="admin-inline-empty">Belum ada destinasi. Tambahkan destinasi terlebih dahulu.</p>{/if}</fieldset>
                <RichTextEditor label="Deskripsi paket" bind:value={item.detail} />
                <div class="admin-field-row"><label><span>Harga</span><input value={item.price} on:input={(event) => updatePackage(index, 'price', event.currentTarget.value)} /></label><label><span>Satuan</span><input value={item.unit} on:input={(event) => updatePackage(index, 'unit', event.currentTarget.value)} /></label></div>
                <label><span>Itinerary Indonesia</span><textarea rows="8" value={itineraryText(item.itinerary)} on:change={(event) => updateItinerary(index, event.currentTarget.value)}></textarea><small>Baris pertama adalah judul hari, baris berikutnya aktivitas. Pisahkan setiap hari dengan satu baris kosong.</small></label>
                <div class="admin-field-row"><label><span>Sudah termasuk</span><textarea rows="5" value={(item.includes || []).join('\n')} on:change={(event) => updateLines(index, 'includes', event.currentTarget.value)}></textarea><small>Satu fasilitas per baris.</small></label><label><span>Belum termasuk</span><textarea rows="5" value={(item.excludes || []).join('\n')} on:change={(event) => updateLines(index, 'excludes', event.currentTarget.value)}></textarea><small>Satu item per baris.</small></label></div>
                <fieldset class="admin-subsection"><legend>Harga berdasarkan jumlah tamu</legend>{#each item.priceTiers || [] as tier, tierIndex}<div class="admin-price-tier"><input aria-label="Jumlah tamu" value={tier.guests} on:input={(event) => updatePriceTier(index, tierIndex, 'guests', event.currentTarget.value)} /><input aria-label="Harga" value={tier.price} on:input={(event) => updatePriceTier(index, tierIndex, 'price', event.currentTarget.value)} /><input aria-label="Keterangan" value={tier.note} on:input={(event) => updatePriceTier(index, tierIndex, 'note', event.currentTarget.value)} /><button type="button" on:click={() => removePriceTier(index, tierIndex)}>Hapus</button></div>{/each}<button class="admin-secondary compact" type="button" on:click={() => addPriceTier(index)}>Tambah pilihan harga</button></fieldset>

                {#if item.image}<div class="admin-image-preview"><img src={item.image} alt="Pratinjau {item.name}" /><span><strong>Gambar utama saat ini</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage(`gambar utama ${item.name}`, (value) => updatePackage(index, 'image', value))} aria-label="Hapus gambar utama {item.name}"><TrashIcon /></button></div>{/if}
                <label><span>Upload gambar utama</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'image', url), `package-${index}`)} /><small>{uploading === `package-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}</small></label>
                {#if item.images?.length}<div class="admin-gallery-preview">{#each item.images as image, imageIndex}<figure><img src={image} alt="Galeri {item.name} {imageIndex + 1}" /><button class="admin-image-trash" type="button" on:click={() => removeGalleryImage(item.images, imageIndex, (images) => updatePackage(index, 'images', images))} aria-label="Hapus gambar galeri {imageIndex + 1} dari {item.name}"><TrashIcon /></button></figure>{/each}</div>{/if}
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'images', [...(item.images || []), url]), `gallery-${index}`)} /><small>{uploading === `gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri.'}</small></label>
              </div><button class="admin-delete" on:click={() => removePackage(index)} aria-label="Hapus paket {item.name}">Hapus paket</button></div>
            </details>
          {/each}
        </div>
      </section>
    {:else if active === 'destinations'}
      <section class="admin-section" aria-labelledby="admin-destinations-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Inspirasi perjalanan</p><h3 id="admin-destinations-title">Destinasi</h3></div><button class="admin-secondary" on:click={addDestination}>Tambah destinasi</button></div>
        <div class="admin-editor-list">
          {#each catalog.destinations as item, index}
            <details class="admin-editor-card" open={index === 0}>
              <summary class="admin-editor-summary"><span class="admin-card-number">{String(index + 1).padStart(2, '0')}</span>{#if item.image}<img src={item.image} alt="" />{/if}<span class="admin-item-summary"><b>{item.name}</b><small>{item.note}</small></span><span class="admin-editor-toggle">Edit</span></summary>
              <div class="admin-editor-body"><div class="admin-fields">
                <label><span>Nama destinasi</span><input value={item.name} on:input={(event) => updateDestination(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Keterangan singkat</span><input value={item.note} on:input={(event) => updateDestination(index, 'note', event.currentTarget.value)} /></label>
                <RichTextEditor label="Deskripsi destinasi" bind:value={item.detail} />
                <fieldset class="admin-subsection admin-destination-picker"><legend>Paket untuk destinasi ini</legend><p>Centang paket yang ingin ditampilkan pada halaman {item.name}.</p>{#if catalog.packages.length}<div class="admin-checkbox-list">{#each catalog.packages as packageItem, packageIndex}<label class:selected={(packageItem.destinationSlugs || []).includes(item.slug)}><input type="checkbox" checked={(packageItem.destinationSlugs || []).includes(item.slug)} on:change={(event) => setPackageDestination(packageIndex, item.slug, event.currentTarget.checked)} /><span><strong>{packageItem.name}</strong><small>{packageItem.duration} · {packageItem.price}</small></span></label>{/each}</div>{:else}<p class="admin-inline-empty">Belum ada paket wisata.</p>{/if}</fieldset>

                {#if item.image}<div class="admin-image-preview"><img src={item.image} alt="Pratinjau {item.name}" /><span><strong>Gambar utama saat ini</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage(`gambar utama ${item.name}`, (value) => updateDestination(index, 'image', value))} aria-label="Hapus gambar utama {item.name}"><TrashIcon /></button></div>{/if}
                <label><span>Upload gambar</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'image', url), `destination-${index}`)} /><small>{uploading === `destination-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}</small></label>
                {#if item.images?.length}<div class="admin-gallery-preview">{#each item.images as image, imageIndex}<figure><img src={image} alt="Galeri {item.name} {imageIndex + 1}" /><button class="admin-image-trash" type="button" on:click={() => removeGalleryImage(item.images, imageIndex, (images) => updateDestination(index, 'images', images))} aria-label="Hapus gambar galeri {imageIndex + 1} dari {item.name}"><TrashIcon /></button></figure>{/each}</div>{/if}
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'images', [...(item.images || []), url]), `destination-gallery-${index}`)} /><small>{uploading === `destination-gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri destinasi.'}</small></label>
              </div><button class="admin-delete" on:click={() => removeDestination(index)} aria-label="Hapus destinasi {item.name}">Hapus destinasi</button></div>
            </details>
          {/each}
        </div>
      </section>
    {:else if active === 'travel'}
      <section class="admin-section admin-narrow" aria-labelledby="admin-travel-title">
        <p class="admin-kicker">Tarif perjalanan</p><h3 id="admin-travel-title">Paket Travel</h3>
        <p class="admin-description">Tarif diterapkan pada setiap kilometer rute jalan yang dihitung di halaman pemesanan.</p>
        <label class="admin-rate"><span>Tarif per kilometer</span><div><b>Rp</b><input type="number" min="1000" step="1000" bind:value={catalog.travelRate} /><em>/ km</em></div></label>
      </section>
    {:else if active === 'rentals'}
      <section class="admin-section" aria-labelledby="admin-rentals-title">
        <p class="admin-kicker">Katalog kendaraan</p><h3 id="admin-rentals-title">Rental</h3>
        <div class="admin-editor-list">
          {#each catalog.rentals as item, index}
            <article class="admin-editor-card rental-editor">
              <div class="admin-card-number">{item.symbol}</div>
              <div class="admin-fields"><label><span>Nama layanan</span><input value={item.name} on:input={(event) => updateRental(index, 'name', event.currentTarget.value)} /></label><RichTextEditor label="Keterangan layanan" bind:value={item.detail} /><label><span>Harga yang ditampilkan</span><input value={item.price} on:input={(event) => updateRental(index, 'price', event.currentTarget.value)} /></label></div>
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
          <fieldset><legend>Kontak</legend>
            <label><span>Nomor WhatsApp</span><input bind:value={catalog.settings.whatsapp} inputmode="tel" placeholder="Contoh: 628123456789" /><small>Gunakan kode negara 62. Nomor ini dipakai semua tombol pemesanan.</small></label>
            <label><span>Email</span><input bind:value={catalog.settings.email} type="email" placeholder="hello@contoh.com" /></label>
            <label><span>Lokasi</span><input bind:value={catalog.settings.location} placeholder="Lombok, Nusa Tenggara Barat" /></label>
          </fieldset>
          <fieldset><legend>Halaman utama</legend>
            <label><span>Palet warna website</span><select bind:value={catalog.settings.colorTheme}><option value="classic">Klasik: hijau dan emas</option><option value="ocean">Laut Lombok: navy dan teal</option></select><small>Pratinjau langsung terlihat di admin. Simpan untuk menerapkannya ke website publik.</small></label>
            <label><span>Judul utama</span><textarea rows="2" bind:value={catalog.settings.heroTitle}></textarea></label>
            <RichTextEditor label="Deskripsi utama" bind:value={catalog.settings.heroDescription} />
            {#if catalog.settings.heroImage}<div class="admin-image-preview"><img src={catalog.settings.heroImage} alt="Pratinjau gambar latar bagian atas" /><span><strong>Background bagian atas</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage('gambar latar bagian atas', (value) => catalog.settings.heroImage = value)} aria-label="Hapus gambar latar bagian atas"><TrashIcon /></button></div>{/if}
            <label><span>Upload gambar latar bagian atas</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => catalog.settings.heroImage = url, 'hero-background')} /><small>{uploading === 'hero-background' ? 'Mengunggah…' : 'Gambar landscape disarankan. Maksimal 5 MB.'}</small></label>
            <label><span>Judul bagian profil</span><textarea rows="2" bind:value={catalog.settings.aboutTitle}></textarea></label>
            <RichTextEditor label="Deskripsi profil" bind:value={catalog.settings.aboutDescription} />
            {#if catalog.settings.aboutImage}<div class="admin-image-preview"><img src={catalog.settings.aboutImage} alt="Pratinjau gambar bagian profil" /><span><strong>Gambar Mengapa Wonderful Lombok</strong><small>Gunakan tombol sampah untuk menghapus.</small></span><button class="admin-image-trash" type="button" on:click={() => clearImage('gambar bagian profil', (value) => catalog.settings.aboutImage = value)} aria-label="Hapus gambar bagian profil"><TrashIcon /></button></div>{/if}
            <label><span>Upload gambar bagian profil</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => catalog.settings.aboutImage = url, 'about-background')} /><small>{uploading === 'about-background' ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}</small></label>
          </fieldset>
          <fieldset><legend>Media sosial</legend>
            <label><span>URL Instagram</span><input bind:value={catalog.settings.instagram} type="url" placeholder="https://instagram.com/..." /></label>
            <label><span>URL TikTok</span><input bind:value={catalog.settings.tiktok} type="url" placeholder="https://tiktok.com/@..." /></label>
            <label><span>URL Facebook</span><input bind:value={catalog.settings.facebook} type="url" placeholder="https://facebook.com/..." /></label>
          </fieldset>
        </div>
      </section>
    {/if}
  </main>
</div>
