<script>
  import { createWhatsAppUrl } from '#lib/whatsapp.js';
  import { getCopy, languages, localePath } from '#lib/i18n.js';
  import LanguageSelector from '#lib/LanguageSelector.svelte';
  import WhatsAppFloat from '#lib/WhatsAppFloat.svelte';
  export let data;
  const c = getCopy(data.locale);
  const home = localePath(data.locale);
</script>

<svelte:head>
  <title>{c.catalogTitle} | Wonderful Lombok</title>
  <meta name="description" content={c.catalogIntro} />
  <link rel="canonical" href={data.canonicalUrl} />
  {#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:title" content={`${c.catalogTitle} | Wonderful Lombok`} />
  <meta property="og:description" content={c.catalogIntro} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:url" content={data.canonicalUrl} />
</svelte:head>

<header class="inner-header">
  <a class="brand brand-logo" href={home}><img src="/wonderful-lombok-logo.png" alt="Wonderful Lombok" /></a>
  <nav aria-label={c.language}><a href={home}>{c.backHome}</a><LanguageSelector locale={data.locale} suffix="/paket-wisata" /></nav>
</header>
<main class="catalog-page">
  <section class="catalog-intro"><p class="label">Wonderful Lombok</p><h1>{c.catalogTitle}</h1><p>{c.catalogIntro}</p></section>
  <section class="tour-catalog" aria-label={c.catalogTitle}>
    {#each data.catalog.packages as item}
      <article class="tour-listing">
        <a class="tour-listing-image" href={`/${data.locale}/paket-wisata/${item.slug}`}><img src={item.image} alt={item.name} /></a>
        <div class="tour-listing-body">
          <div class="tour-meta"><span>{item.category}</span><span>{item.duration}</span></div>
          <h2><a href={`/${data.locale}/paket-wisata/${item.slug}`}>{item.name}</a></h2>
          <p>{item.detail}</p>
          <strong>{c.from} {item.price} <small>{item.unit}</small></strong>
          <a class="button dark" href={`/${data.locale}/paket-wisata/${item.slug}`}>{c.viewDetail}</a>
        </div>
      </article>
    {/each}
  </section>
  <aside class="catalog-help"><h2>Butuh itinerary khusus?</h2><a class="button primary" href={createWhatsAppUrl('Halo Wonderful Lombok, saya ingin itinerary khusus di Lombok.', data.catalog.settings.whatsapp)} target="_blank" rel="noreferrer">{c.consult}</a></aside>
</main>
<WhatsAppFloat whatsapp={data.catalog.settings.whatsapp} locale="id" />
