<script>
  import PickupCalculator from '../lib/PickupCalculator.svelte';
  import BookingDialog from '../lib/BookingDialog.svelte';
  import DetailDialog from '../lib/DetailDialog.svelte';
  import { createWhatsAppUrl } from '../lib/whatsapp.js';

  export let data;
  let menuOpen = false;
  let booking = null;
  let detailItem = null;
  let detailKind = 'paket';
  let packages = data.catalog.packages;
  let transport = data.catalog.rentals;
  let travelRate = data.catalog.travelRate;
  let settings = data.catalog.settings;
  $: seoDescription = `Paket wisata Lombok, travel bandara dan pelabuhan, serta rental kendaraan dengan driver lokal. Pesan perjalanan privat bersama Wonderful Lombok.`;
  $: formattedTravelRate = new Intl.NumberFormat('id-ID').format(travelRate);
  let destinations = data.catalog.destinations;
  let faqs = data.catalog.faqs;
  function showDetail(item, kind) { detailItem = item; detailKind = kind; }
  function closeMenu() { menuOpen = false; }
  function reveal(node) {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
    if (node.getBoundingClientRect().top < window.innerHeight * 0.82) return {};
    node.classList.add('reveal-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('reveal-visible');
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<svelte:head>
  <title>Paket Wisata Lombok, Travel & Rental | Wonderful Lombok</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  <link rel="alternate" hreflang="id-ID" href={data.canonicalUrl} />
  <link rel="alternate" hreflang="x-default" href={data.canonicalUrl} />
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin="anonymous" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:image:alt" content="Pemandangan perjalanan di Lombok bersama Wonderful Lombok" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={data.socialImageUrl} />
  <meta name="twitter:image:alt" content="Pemandangan perjalanan di Lombok bersama Wonderful Lombok" />
</svelte:head>

<header class="site-header">
  <a class="brand" href="#top" aria-label="Wonderful Lombok, kembali ke atas"><span>Wonderful</span><b>Lombok</b></a>
  <button class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" on:click={() => menuOpen = !menuOpen}><span class="sr-only">Buka navigasi</span><i></i><i></i></button>
  <nav id="main-navigation" class:open={menuOpen} aria-label="Navigasi utama">
    <a href="#paket" on:click={closeMenu}>Paket wisata</a><a href="#paket-travel" on:click={closeMenu}>Paket Travel</a><a href="#rental" on:click={closeMenu}>Rental</a><a href="#destinasi" on:click={closeMenu}>Destinasi</a>
    <a class="nav-action" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin konsultasi perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">Konsultasi WhatsApp</a>
  </nav>
</header>

<main id="top" itemscope itemtype="https://schema.org/TravelAgency">
  <meta itemprop="name" content="Wonderful Lombok" />
  <meta itemprop="url" content={data.canonicalUrl} />
  <meta itemprop="image" content={data.socialImageUrl} />
  <meta itemprop="description" content={seoDescription} />
  <meta itemprop="email" content={settings.email} />
  <meta itemprop="telephone" content={`+${settings.whatsapp.replace(/\D/g, '')}`} />
  <meta itemprop="areaServed" content="Pulau Lombok, Nusa Tenggara Barat" />
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-image" role="img" aria-label="Pantai tropis dengan laut biru"></div><div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="label">Private trip di Lombok</p><h1 id="hero-title">{settings.heroTitle}</h1>
      <p class="hero-intro">{settings.heroDescription}</p>
      <div class="hero-actions"><a class="button primary" href="#pilih-layanan">Pilih kebutuhan perjalanan</a><a class="text-link" href="#paket">Lihat paket wisata</a></div>
    </div>
  </section>

  <section class="service-choice section" id="pilih-layanan" aria-labelledby="choice-title" use:reveal>
    <div class="choice-heading"><p class="label">Mulai dari sini</p><h2 id="choice-title">Kamu sedang merencanakan liburan atau mencari kendaraan?</h2></div>
    <div class="choice-list">
      <article><span>01</span><h3>Paket wisata</h3><p>Untuk kamu yang ingin itinerary, destinasi, dan perjalanan sudah disiapkan.</p><a href="#paket">Lihat pilihan paket</a></article>
      <article><span>02</span><h3>Paket Travel</h3><p>Untuk antar-jemput dari bandara, pelabuhan, hotel, atau kawasan wisata.</p><a href="#paket-travel">Hitung biaya travel</a></article>
      <article><span>03</span><h3>Rental kendaraan</h3><p>Untuk menyewa mobil dengan driver atau motor selama berada di Lombok.</p><a href="#rental">Lihat pilihan rental</a></article>
    </div>
  </section>

  <section class="packages section" id="paket" aria-labelledby="packages-title" use:reveal>
    <div class="section-heading"><div><p class="label">Paket wisata</p><h2 id="packages-title">Rute pilihan untuk menikmati Lombok.</h2></div><p>Pilih paket yang sesuai dengan waktumu. Untuk itinerary khusus, tanyakan langsung melalui WhatsApp.</p></div>
    <div class="package-list" itemprop="hasOfferCatalog" itemscope itemtype="https://schema.org/OfferCatalog">
      <meta itemprop="name" content="Paket perjalanan Wonderful Lombok" />
      {#each packages as item, index}
        <article class:featured={index === 0} class="package-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/Offer"><button class="card-image-button" type="button" on:click={() => showDetail(item, 'paket wisata')} aria-label="Lihat detail dan galeri {item.name}"><img src={item.image} alt="Pemandangan untuk paket {item.name}" loading="lazy" itemprop="image" /></button><div class="package-body"><span class="package-number">0{index + 1}</span><h3 itemprop="name">{item.name}</h3><p itemprop="description">{item.route}</p><div class="package-price"><strong>{item.price}</strong><span>{item.unit}</span></div><button class="inline-book" on:click={() => booking = { type: 'wisata', name: item.name }}>Pesan paket wisata</button></div></article>
      {/each}
    </div>
  </section>

  <section class="destinations" id="destinasi" aria-labelledby="destinations-title">
    <div class="section section-heading" use:reveal><div><p class="label">Destinasi Lombok</p><h2 id="destinations-title">Pantai, pulau kecil, dan pegunungan.</h2></div><p>Gunakan destinasi ini sebagai inspirasi. Tim Wonderful Lombok dapat membantu menyusunnya menjadi itinerary.</p></div>
    <div class="destination-grid section" use:reveal>
      {#each destinations as destination, index}
        <button class:wide={index === 0} class="destination-card" type="button" style={`background-image: linear-gradient(0deg, rgba(5,35,29,.78), rgba(5,35,29,.02) 70%), url('${destination.image}')`} on:click={() => showDetail(destination, 'destinasi')}><div><h3>{destination.name}</h3><p>{destination.note}</p></div></button>
      {/each}
    </div>
  </section>

  <section class="travel-section" id="paket-travel" aria-labelledby="travel-title">
    <div class="section travel-heading" use:reveal>
      <div><p class="label">Paket Travel</p><h2 id="travel-title">Antar-jemput sesuai titik perjalananmu.</h2></div>
      <div class="travel-description"><p>Pilih lokasi jemput dan tujuan. Biaya dihitung berdasarkan perkiraan jarak perjalanan dengan tarif Rp{formattedTravelRate} per kilometer.</p><dl><div><dt>Cocok untuk</dt><dd>Bandara, pelabuhan, hotel, dan destinasi</dd></div><div><dt>Pemesanan</dt><dd>Konfirmasi langsung melalui WhatsApp</dd></div></dl></div>
    </div>
    <div class="section pickup-block" id="hitung-travel" use:reveal>
      <div class="pickup-intro"><div><p class="label">Hitung Paket Travel</p><h2>Masukkan titik jemput dan tujuanmu.</h2></div><p>Lihat perkiraan biaya, lalu kirim detail perjalanan kepada tim Wonderful Lombok.</p></div>
      <div class="calculator-wrap"><PickupCalculator rate={travelRate} whatsapp={settings.whatsapp} /></div>
    </div>
  </section>

  <section class="rental-section section" id="rental" aria-labelledby="rental-title" use:reveal>
    <div class="section-heading"><div><p class="label">Rental kendaraan</p><h2 id="rental-title">Kendaraan untuk dipakai selama di Lombok.</h2></div><p>Pilih rental harian jika kamu membutuhkan kendaraan untuk beberapa tujuan dalam satu hari.</p></div>
    <div class="rental-list">
      {#each transport as item}
        <article><span class="transport-symbol" aria-hidden="true">{item.symbol}</span><div><h3>{item.name}</h3><p>{item.detail}</p><strong>{item.price}</strong></div><button class="inline-book" on:click={() => booking = { type: 'rental', name: item.name }}>Pesan rental</button></article>
      {/each}
    </div>
  </section>

  <section class="about section" id="tentang" aria-labelledby="about-title" use:reveal>
    <div class="about-image" role="img" aria-label="Perbukitan hijau dan laut Lombok"></div>
    <div class="about-copy"><p class="label">Mengapa Wonderful Lombok</p><h2 id="about-title">{settings.aboutTitle}</h2><p>{settings.aboutDescription}</p><ul class="check-list"><li>Private dan custom trip</li><li>Driver lokal</li><li>Itinerary fleksibel</li><li>Konsultasi melalui WhatsApp</li></ul><a class="button dark" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin konsultasi untuk merencanakan perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">Konsultasikan perjalanan</a></div>
  </section>

  <section class="faq section" aria-labelledby="faq-title" use:reveal itemscope itemtype="https://schema.org/FAQPage">
    <div><p class="label">Pertanyaan umum</p><h2 id="faq-title">Sebelum berangkat.</h2></div>
    <div class="faq-list">{#each faqs as faq}<details itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><summary itemprop="name">{faq.question}</summary><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">{faq.answer}</p></div></details>{/each}</div>
  </section>
</main>

<footer id="kontak">
  <div class="footer-brand"><span>Wonderful</span><b>Lombok</b><p>Partner lokal untuk perjalananmu di Lombok.</p></div>
  <div class="footer-links"><a href="#paket">Paket wisata</a><a href="#paket-travel">Paket Travel</a><a href="#rental">Rental kendaraan</a><a href="#destinasi">Destinasi</a></div>
  <div class="footer-contact"><strong>Hubungi kami</strong><a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {settings.whatsapp}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><span>{settings.location}</span>{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>{/if}</div>
</footer>
<BookingDialog bind:booking whatsapp={settings.whatsapp} />
<DetailDialog bind:item={detailItem} kind={detailKind} onBook={detailKind === 'paket wisata' ? (item) => booking = { type: 'wisata', name: item.name } : null} />
