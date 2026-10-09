<script>
  import PickupCalculator from '../lib/PickupCalculator.svelte';
  import BookingDialog from '../lib/BookingDialog.svelte';
  import { createWhatsAppUrl } from '../lib/whatsapp.js';

  export let data;
  let menuOpen = false;
  let booking = null;
  let packages = data.catalog.packages;
  let transport = data.catalog.rentals;
  let travelRate = data.catalog.travelRate;
  let settings = data.catalog.settings;
  $: seoDescription = `Paket wisata Lombok, travel bandara dan pelabuhan, serta rental kendaraan dengan driver lokal. Pesan perjalanan privat bersama Wonderful Lombok.`;
  $: structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TravelAgency'],
    name: 'Wonderful Lombok',
    url: data.canonicalUrl,
    description: seoDescription,
    email: settings.email,
    telephone: `+${settings.whatsapp.replace(/\D/g, '')}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Lombok', addressRegion: 'Nusa Tenggara Barat', addressCountry: 'ID' },
    areaServed: { '@type': 'Place', name: 'Lombok, Nusa Tenggara Barat' },
    sameAs: [settings.instagram, settings.tiktok, settings.facebook].filter(Boolean),
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Paket perjalanan Wonderful Lombok', itemListElement: packages.map((item) => ({ '@type': 'Offer', name: item.name, description: item.route, priceCurrency: 'IDR' })) }
  }).replaceAll('<', '\\u003c');
  $: formattedTravelRate = new Intl.NumberFormat('id-ID').format(travelRate);
  const destinations = [
    { name: 'Mandalika', note: 'Pantai dan petualangan', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=82' },
    { name: 'Tanjung Aan', note: 'Pasir putih dan laut tenang', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=82' },
    { name: 'Gili Islands', note: 'Snorkeling dan island hopping', image: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?auto=format&fit=crop&w=900&q=82' },
    { name: 'Sembalun', note: 'Pegunungan dan udara sejuk', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=82' },
    { name: 'Senggigi', note: 'Pesisir untuk melihat sunset', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=82' }
  ];
  function closeMenu() { menuOpen = false; }
</script>

<svelte:head>
  <title>Paket Wisata Lombok, Travel & Rental | Wonderful Lombok</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href={data.canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:image" content={packages[0]?.image} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Paket Wisata Lombok, Travel & Rental | Wonderful Lombok" />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={packages[0]?.image} />
  {@html `<script type="application/ld+json">${structuredData}<\/script>`}
</svelte:head>

<header class="site-header">
  <a class="brand" href="#top" aria-label="Wonderful Lombok, kembali ke atas"><span>Wonderful</span><b>Lombok</b></a>
  <button class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" on:click={() => menuOpen = !menuOpen}><span class="sr-only">Buka navigasi</span><i></i><i></i></button>
  <nav id="main-navigation" class:open={menuOpen} aria-label="Navigasi utama">
    <a href="#paket" on:click={closeMenu}>Paket wisata</a><a href="#paket-travel" on:click={closeMenu}>Paket Travel</a><a href="#rental" on:click={closeMenu}>Rental</a><a href="#destinasi" on:click={closeMenu}>Destinasi</a>
    <a class="nav-action" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin konsultasi perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">Konsultasi WhatsApp</a>
  </nav>
</header>

<main id="top">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-image" role="img" aria-label="Pantai tropis dengan laut biru"></div><div class="hero-shade"></div>
    <div class="hero-copy">
      <p class="label">Private trip di Lombok</p><h1 id="hero-title">{settings.heroTitle}</h1>
      <p class="hero-intro">{settings.heroDescription}</p>
      <div class="hero-actions"><a class="button primary" href="#pilih-layanan">Pilih kebutuhan perjalanan</a><a class="text-link" href="#paket">Lihat paket wisata</a></div>
    </div>
  </section>

  <section class="service-choice section" id="pilih-layanan" aria-labelledby="choice-title">
    <div class="choice-heading"><p class="label">Mulai dari sini</p><h2 id="choice-title">Kamu sedang merencanakan liburan atau mencari kendaraan?</h2></div>
    <div class="choice-list">
      <article><span>01</span><h3>Paket wisata</h3><p>Untuk kamu yang ingin itinerary, destinasi, dan perjalanan sudah disiapkan.</p><a href="#paket">Lihat pilihan paket</a></article>
      <article><span>02</span><h3>Paket Travel</h3><p>Untuk antar-jemput dari bandara, pelabuhan, hotel, atau kawasan wisata.</p><a href="#paket-travel">Hitung biaya travel</a></article>
      <article><span>03</span><h3>Rental kendaraan</h3><p>Untuk menyewa mobil dengan driver atau motor selama berada di Lombok.</p><a href="#rental">Lihat pilihan rental</a></article>
    </div>
  </section>

  <section class="packages section" id="paket" aria-labelledby="packages-title">
    <div class="section-heading"><div><p class="label">Paket wisata</p><h2 id="packages-title">Rute pilihan untuk menikmati Lombok.</h2></div><p>Pilih paket yang sesuai dengan waktumu. Untuk itinerary khusus, tanyakan langsung melalui WhatsApp.</p></div>
    <div class="package-list">
      {#each packages as item, index}
        <article class:featured={index === 0} class="package-card"><img src={item.image} alt="Pemandangan untuk paket {item.name}" loading="lazy" /><div class="package-body"><span class="package-number">0{index + 1}</span><h3>{item.name}</h3><p>{item.route}</p><div class="package-price"><strong>{item.price}</strong><span>{item.unit}</span></div><button class="inline-book" on:click={() => booking = { type: 'wisata', name: item.name }}>Pesan paket wisata</button></div></article>
      {/each}
    </div>
  </section>

  <section class="destinations" id="destinasi" aria-labelledby="destinations-title">
    <div class="section section-heading"><div><p class="label">Destinasi Lombok</p><h2 id="destinations-title">Pantai, pulau kecil, dan pegunungan.</h2></div><p>Gunakan destinasi ini sebagai inspirasi. Tim Wonderful Lombok dapat membantu menyusunnya menjadi itinerary.</p></div>
    <div class="destination-grid section">
      {#each destinations as destination, index}
        <article class:wide={index === 0} style={`background-image: linear-gradient(0deg, rgba(5,35,29,.78), rgba(5,35,29,.02) 70%), url('${destination.image}')`}><div><h3>{destination.name}</h3><p>{destination.note}</p></div></article>
      {/each}
    </div>
  </section>

  <section class="travel-section" id="paket-travel" aria-labelledby="travel-title">
    <div class="section travel-heading">
      <div><p class="label">Paket Travel</p><h2 id="travel-title">Antar-jemput sesuai titik perjalananmu.</h2></div>
      <div class="travel-description"><p>Pilih lokasi jemput dan tujuan. Biaya dihitung berdasarkan perkiraan jarak perjalanan dengan tarif Rp{formattedTravelRate} per kilometer.</p><dl><div><dt>Cocok untuk</dt><dd>Bandara, pelabuhan, hotel, dan destinasi</dd></div><div><dt>Pemesanan</dt><dd>Konfirmasi langsung melalui WhatsApp</dd></div></dl></div>
    </div>
    <div class="section pickup-block" id="hitung-travel">
      <div class="pickup-intro"><div><p class="label">Hitung Paket Travel</p><h2>Masukkan titik jemput dan tujuanmu.</h2></div><p>Lihat perkiraan biaya, lalu kirim detail perjalanan kepada tim Wonderful Lombok.</p></div>
      <div class="calculator-wrap"><PickupCalculator rate={travelRate} whatsapp={settings.whatsapp} /></div>
    </div>
  </section>

  <section class="rental-section section" id="rental" aria-labelledby="rental-title">
    <div class="section-heading"><div><p class="label">Rental kendaraan</p><h2 id="rental-title">Kendaraan untuk dipakai selama di Lombok.</h2></div><p>Pilih rental harian jika kamu membutuhkan kendaraan untuk beberapa tujuan dalam satu hari.</p></div>
    <div class="rental-list">
      {#each transport as item}
        <article><span class="transport-symbol" aria-hidden="true">{item.symbol}</span><div><h3>{item.name}</h3><p>{item.detail}</p><strong>{item.price}</strong></div><button class="inline-book" on:click={() => booking = { type: 'rental', name: item.name }}>Pesan rental</button></article>
      {/each}
    </div>
  </section>

  <section class="about section" id="tentang" aria-labelledby="about-title">
    <div class="about-image" role="img" aria-label="Perbukitan hijau dan laut Lombok"></div>
    <div class="about-copy"><p class="label">Mengapa Wonderful Lombok</p><h2 id="about-title">{settings.aboutTitle}</h2><p>{settings.aboutDescription}</p><ul class="check-list"><li>Private dan custom trip</li><li>Driver lokal</li><li>Itinerary fleksibel</li><li>Konsultasi melalui WhatsApp</li></ul><a class="button dark" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin konsultasi untuk merencanakan perjalanan di Lombok.', settings.whatsapp)} target="_blank" rel="noreferrer">Konsultasikan perjalanan</a></div>
  </section>

  <section class="faq section" aria-labelledby="faq-title">
    <div><p class="label">Pertanyaan umum</p><h2 id="faq-title">Sebelum berangkat.</h2></div>
    <div class="faq-list"><details><summary>Apakah itinerary bisa disesuaikan?</summary><p>Bisa. Destinasi, durasi, aktivitas, dan transportasi dapat disesuaikan dengan kebutuhan perjalanan.</p></details><details><summary>Apakah tersedia perjalanan privat?</summary><p>Tersedia untuk pasangan, keluarga, maupun grup. Sampaikan jumlah peserta saat konsultasi.</p></details><details><summary>Apakah travel bisa menjemput di bandara?</summary><p>Bisa. Pilih Bandara Internasional Lombok sebagai titik jemput pada kalkulator untuk melihat estimasinya.</p></details></div>
  </section>
</main>

<footer id="kontak">
  <div class="footer-brand"><span>Wonderful</span><b>Lombok</b><p>Partner lokal untuk perjalananmu di Lombok.</p></div>
  <div class="footer-links"><a href="#paket">Paket wisata</a><a href="#paket-travel">Paket Travel</a><a href="#rental">Rental kendaraan</a><a href="#destinasi">Destinasi</a></div>
  <div class="footer-contact"><strong>Hubungi kami</strong><a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {settings.whatsapp}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><span>{settings.location}</span>{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>{/if}</div>
</footer>
<BookingDialog bind:booking whatsapp={settings.whatsapp} />
