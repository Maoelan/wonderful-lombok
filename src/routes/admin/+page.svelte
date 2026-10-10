<script>
  export let data;
  let catalog = structuredClone(data.catalog);
  let bookings = data.bookings;
  let active = 'packages';
  let saved = false;
  let saveError = '';
  let uploading = '';

  async function persist() {
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
    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(catalog)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Perubahan gagal disimpan.');
      saved = true;
      setTimeout(() => saved = false, 2400);
    } catch (error) {
      saveError = error.message;
    }
  }

  function updatePackage(index, field, value) {
    catalog.packages[index][field] = value;
    catalog = { ...catalog };
  }

  function updateRental(index, field, value) {
    catalog.rentals[index][field] = value;
    catalog = { ...catalog };
  }

  function addPackage() {
    catalog.packages = [...catalog.packages, { name: 'Paket baru', route: 'Isi destinasi paket', detail: 'Isi detail paket', price: 'Rp0', unit: 'per orang', image: '', images: [] }];
    catalog = { ...catalog };
  }

  function updateDestination(index, field, value) {
    catalog.destinations[index][field] = value;
    catalog = { ...catalog };
  }

  function addDestination() {
    catalog.destinations = [...catalog.destinations, { name: 'Destinasi baru', note: 'Keterangan singkat', detail: 'Isi detail destinasi', image: '', images: [] }];
    catalog = { ...catalog };
  }

  function removeDestination(index) {
    if (!confirm(`Hapus destinasi ${catalog.destinations[index].name}?`)) return;
    catalog.destinations = catalog.destinations.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
  }

  function updateFaq(index, field, value) {
    catalog.faqs[index][field] = value;
    catalog = { ...catalog };
  }

  function addFaq() {
    catalog.faqs = [...catalog.faqs, { question: 'Pertanyaan baru', answer: 'Tulis jawaban yang membantu pelanggan.' }];
    catalog = { ...catalog };
  }

  function removeFaq(index) {
    if (!confirm(`Hapus pertanyaan “${catalog.faqs[index].question}”?`)) return;
    catalog.faqs = catalog.faqs.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
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
    } catch (error) { saveError = error.message; }
    finally { uploading = ''; }
  }

  function removePackage(index) {
    if (!confirm(`Hapus paket ${catalog.packages[index].name}?`)) return;
    catalog.packages = catalog.packages.filter((_, itemIndex) => itemIndex !== index);
    catalog = { ...catalog };
  }

  async function setBookingStatus(item, status) {
    const response = await fetch(`/api/admin/bookings/${item.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!response.ok) { saveError = 'Status pemesanan gagal diperbarui.'; return; }
    item.status = status; bookings = [...bookings];
  }
</script>

<svelte:head><title>Admin | Wonderful Lombok</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="admin-shell">
  <aside class="admin-sidebar">
    <a class="admin-brand" href="/"><span>Wonderful</span><b>Lombok</b></a>
    <div><p class="admin-kicker">Pengelolaan konten</p><h1>Admin</h1></div>
    <nav aria-label="Menu admin">
      <button class:active={active === 'bookings'} on:click={() => active = 'bookings'}>Pemesanan <span>{bookings.filter((item) => item.status === 'baru').length}</span></button>
      <button class:active={active === 'packages'} on:click={() => active = 'packages'}>Paket Wisata <span>{catalog.packages.length}</span></button>
      <button class:active={active === 'destinations'} on:click={() => active = 'destinations'}>Destinasi <span>{catalog.destinations.length}</span></button>
      <button class:active={active === 'travel'} on:click={() => active = 'travel'}>Paket Travel</button>
      <button class:active={active === 'rentals'} on:click={() => active = 'rentals'}>Rental <span>{catalog.rentals.length}</span></button>
      <button class:active={active === 'faqs'} on:click={() => active = 'faqs'}>FAQ <span>{catalog.faqs.length}</span></button>
      <button class:active={active === 'settings'} on:click={() => active = 'settings'}>Informasi Website</button>
    </nav>
    <a class="admin-site-link" href="/" target="_blank" rel="noreferrer">Lihat website</a>
    <form class="admin-logout" method="POST" action="/logout"><button type="submit">Keluar dari admin</button></form>
  </aside>

  <main class="admin-main">
    <header class="admin-header">
      <div><p class="admin-kicker">Wonderful Lombok</p><h2>Kelola layanan</h2></div>
      <div class="admin-actions"><span class:saved aria-live="polite">{saved ? 'Perubahan tersimpan' : 'Belum disimpan'}</span><button class="admin-save" on:click={persist}>Simpan perubahan</button></div>
    </header>

    {#if saveError}<p class="admin-error" role="alert">{saveError}</p>{/if}

    <div class="admin-notice"><strong>Terhubung database</strong><span>Perubahan tersimpan di PostgreSQL dan langsung tersedia untuk setiap pengunjung website. Kamu masuk sebagai {data.user.username}.</span></div>

    {#if active === 'bookings'}
      <section class="admin-section" aria-labelledby="admin-bookings-title">
        <p class="admin-kicker">Permintaan pelanggan</p><h3 id="admin-bookings-title">Pemesanan masuk</h3>
        {#if bookings.length}<div class="booking-admin-list">{#each bookings as item}<article><div><b>{item.code}</b><span>{new Date(item.created_at).toLocaleString('id-ID')}</span></div><h4>{item.service_name}</h4><p>{item.customer_name} · {item.whatsapp} · {new Date(item.travel_date).toLocaleDateString('id-ID')} · {item.people} orang</p><select value={item.status} on:change={(event) => setBookingStatus(item, event.currentTarget.value)} aria-label="Status {item.code}"><option value="baru">Baru</option><option value="dikonfirmasi">Dikonfirmasi</option><option value="selesai">Selesai</option><option value="dibatalkan">Dibatalkan</option></select></article>{/each}</div>{:else}<p class="admin-description">Belum ada pemesanan masuk.</p>{/if}
      </section>
    {:else if active === 'packages'}
      <section class="admin-section" aria-labelledby="admin-packages-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Katalog</p><h3 id="admin-packages-title">Paket Wisata</h3></div><button class="admin-secondary" on:click={addPackage}>Tambah paket</button></div>
        <div class="admin-editor-list">
          {#each catalog.packages as item, index}
            <article class="admin-editor-card">
              <div class="admin-card-number">0{index + 1}</div>
              <div class="admin-fields">
                <label><span>Nama paket</span><input value={item.name} on:input={(event) => updatePackage(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Destinasi dan aktivitas</span><textarea rows="2" value={item.route} on:input={(event) => updatePackage(index, 'route', event.currentTarget.value)}></textarea></label>
                <label><span>Detail paket</span><textarea rows="3" value={item.detail} on:input={(event) => updatePackage(index, 'detail', event.currentTarget.value)}></textarea></label>
                <div class="admin-field-row"><label><span>Harga</span><input value={item.price} on:input={(event) => updatePackage(index, 'price', event.currentTarget.value)} /></label><label><span>Satuan</span><input value={item.unit} on:input={(event) => updatePackage(index, 'unit', event.currentTarget.value)} /></label></div>
                <label><span>URL gambar</span><input type="url" value={item.image} on:input={(event) => updatePackage(index, 'image', event.currentTarget.value)} /></label>
                <label><span>Upload gambar utama</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'image', url), `package-${index}`)} /><small>{uploading === `package-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}</small></label>
                <label><span>Galeri paket (satu URL per baris)</span><textarea rows="4" value={(item.images || []).join('\n')} on:input={(event) => updatePackage(index, 'images', event.currentTarget.value.split('\n').map((value) => value.trim()).filter(Boolean))}></textarea></label>
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updatePackage(index, 'images', [...(item.images || []), url]), `gallery-${index}`)} /><small>{uploading === `gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri.'}</small></label>
              </div>
              <button class="admin-delete" on:click={() => removePackage(index)} aria-label="Hapus paket {item.name}">Hapus</button>
            </article>
          {/each}
        </div>
      </section>
    {:else if active === 'destinations'}
      <section class="admin-section" aria-labelledby="admin-destinations-title">
        <div class="admin-section-heading"><div><p class="admin-kicker">Inspirasi perjalanan</p><h3 id="admin-destinations-title">Destinasi</h3></div><button class="admin-secondary" on:click={addDestination}>Tambah destinasi</button></div>
        <div class="admin-editor-list">
          {#each catalog.destinations as item, index}
            <article class="admin-editor-card">
              <div class="admin-card-number">0{index + 1}</div>
              <div class="admin-fields">
                <label><span>Nama destinasi</span><input value={item.name} on:input={(event) => updateDestination(index, 'name', event.currentTarget.value)} /></label>
                <label><span>Keterangan singkat</span><input value={item.note} on:input={(event) => updateDestination(index, 'note', event.currentTarget.value)} /></label>
                <label><span>Detail destinasi</span><textarea rows="3" value={item.detail} on:input={(event) => updateDestination(index, 'detail', event.currentTarget.value)}></textarea></label>
                <label><span>URL gambar</span><input type="url" value={item.image} on:input={(event) => updateDestination(index, 'image', event.currentTarget.value)} /></label>
                <label><span>Upload gambar</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'image', url), `destination-${index}`)} /><small>{uploading === `destination-${index}` ? 'Mengunggah…' : 'JPG, PNG, atau WebP. Maksimal 5 MB.'}</small></label>
                <label><span>Galeri destinasi (satu URL per baris)</span><textarea rows="4" value={(item.images || []).join('\n')} on:input={(event) => updateDestination(index, 'images', event.currentTarget.value.split('\n').map((value) => value.trim()).filter(Boolean))}></textarea></label>
                <label><span>Tambah gambar galeri</span><input type="file" accept="image/jpeg,image/png,image/webp" on:change={(event) => uploadImage(event.currentTarget.files?.[0], (url) => updateDestination(index, 'images', [...(item.images || []), url]), `destination-gallery-${index}`)} /><small>{uploading === `destination-gallery-${index}` ? 'Mengunggah…' : 'Gambar akan ditambahkan ke galeri destinasi.'}</small></label>
              </div>
              <button class="admin-delete" on:click={() => removeDestination(index)} aria-label="Hapus destinasi {item.name}">Hapus</button>
            </article>
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
              <div class="admin-fields"><label><span>Nama layanan</span><input value={item.name} on:input={(event) => updateRental(index, 'name', event.currentTarget.value)} /></label><label><span>Keterangan</span><textarea rows="2" value={item.detail} on:input={(event) => updateRental(index, 'detail', event.currentTarget.value)}></textarea></label><label><span>Harga yang ditampilkan</span><input value={item.price} on:input={(event) => updateRental(index, 'price', event.currentTarget.value)} /></label></div>
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
            <article class="admin-editor-card">
              <div class="admin-card-number">0{index + 1}</div>
              <div class="admin-fields">
                <label><span>Pertanyaan</span><input maxlength="200" value={item.question} on:input={(event) => updateFaq(index, 'question', event.currentTarget.value)} /></label>
                <label><span>Jawaban</span><textarea rows="4" maxlength="1500" value={item.answer} on:input={(event) => updateFaq(index, 'answer', event.currentTarget.value)}></textarea></label>
              </div>
              <button class="admin-delete" on:click={() => removeFaq(index)} aria-label="Hapus pertanyaan {item.question}">Hapus</button>
            </article>
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
            <label><span>Judul utama</span><textarea rows="2" bind:value={catalog.settings.heroTitle}></textarea></label>
            <label><span>Deskripsi utama</span><textarea rows="3" bind:value={catalog.settings.heroDescription}></textarea></label>
            <label><span>Judul bagian profil</span><textarea rows="2" bind:value={catalog.settings.aboutTitle}></textarea></label>
            <label><span>Deskripsi profil</span><textarea rows="3" bind:value={catalog.settings.aboutDescription}></textarea></label>
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
