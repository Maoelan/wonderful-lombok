<script>
  import DestinationCard from '#lib/DestinationCard.svelte';
  import { groupDestinationsByRegion } from '#lib/catalog-display.js';
  import { destinationSlug, getCopy, languages, localePath } from '#lib/i18n.js';
  import { breadcrumbSchema, getSeoCopy, jsonLdScript } from '#lib/seo.js';
  import SiteHeader from '#lib/SiteHeader.svelte';
  import SiteFooter from '#lib/SiteFooter.svelte';
  import SkipLink from '#lib/SkipLink.svelte';
  export let data;
  $: c = getCopy(data.locale);
  $: seo = getSeoCopy(data.locale);
  $: home = localePath(data.locale);
  $: origin = new URL(data.canonicalUrl).origin;
  $: groups = groupDestinationsByRegion(data.catalog.destinations);
  $: catalogSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([{ name: c.home, url: `${origin}${home}` }, { name: seo.destinationsBreadcrumb, url: data.canonicalUrl }]),
      {
        '@type': 'ItemList',
        name: seo.destinationsTitle,
        itemListElement: data.catalog.destinations.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: `${origin}${localePath(data.locale, `/destinasi/${destinationSlug(item)}`)}`
        }))
      }
    ]
  };
</script>

<svelte:head>
  <title>{seo.destinationsTitle}</title>
  <meta name="description" content={seo.destinationsDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={data.canonicalUrl} />
  {#each languages as language}<link rel="alternate" hreflang={language.hreflang} href={data.alternateUrls[language.code]} />{/each}
  <link rel="alternate" hreflang="x-default" href={data.alternateUrls.id} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content={seo.og} />
  <meta property="og:site_name" content="Wonderful Lombok" />
  <meta property="og:title" content={seo.destinationsTitle} />
  <meta property="og:description" content={seo.destinationsDescription} />
  <meta property="og:image" content={data.socialImageUrl} />
  <meta property="og:image:alt" content={seo.imageAlt} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.destinationsTitle} />
  <meta name="twitter:description" content={seo.destinationsDescription} />
  <meta name="twitter:image" content={data.socialImageUrl} />
  <meta name="twitter:image:alt" content={seo.imageAlt} />
  {@html jsonLdScript(catalogSchema)}
</svelte:head>

<div class="site-theme" class:theme-ocean={data.catalog.settings.colorTheme === 'ocean'}>
  <SkipLink locale={data.locale} />
  <SiteHeader locale={data.locale} suffix="/destinasi" packages={data.catalog.packages} destinations={data.catalog.destinations} />
  <main id="main-content" tabindex="-1" class="catalog-page destination-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href={home}>{c.home}</a><span>/</span><span>{seo.destinationsBreadcrumb}</span></nav>
    <section class="catalog-intro"><h1>{c.destinationLabel}</h1><p>{c.destinationIntro}</p></section>
    {#if groups.length}
      {#each groups as group}
        <section class="destination-region" id={`wilayah-${group.key}`} aria-labelledby={`wilayah-${group.key}-title`}>
          <h2 id={`wilayah-${group.key}-title`}>{c.regions[group.key]}</h2>
          <div class="destination-grid destination-catalog-grid">
            {#each group.items as item}<DestinationCard {item} locale={data.locale} />{/each}
          </div>
        </section>
      {/each}
    {:else}
      <section class="destination-catalog" aria-labelledby="destination-grid-title">
        <h2 id="destination-grid-title" class="sr-only">{c.destinations}</h2>
        <div class="destination-grid destination-catalog-grid">
          {#each data.catalog.destinations as item}<DestinationCard {item} locale={data.locale} />{/each}
        </div>
      </section>
    {/if}
  </main>
  <SiteFooter settings={data.catalog.settings} locale={data.locale} current="destinations" />
</div>
