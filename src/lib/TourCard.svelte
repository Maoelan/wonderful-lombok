<script>
  import PhotoGallery from './PhotoGallery.svelte';
  import UiIcon from './UiIcon.svelte';
  import { getCopy, sentenceCase } from './i18n.js';
  export let item;
  export let locale = 'id';
  export let onBook;
  $: c = getCopy(locale);
  $: gallery = [...new Set([item.image, ...(item.images || [])].filter(Boolean))];
  $: href = `/${locale}/paket-wisata/${item.slug}`;
  $: category = sentenceCase(item.category);
</script>

<article class="package-card" itemprop="itemListElement" itemscope itemtype="https://schema.org/Offer">
  <PhotoGallery images={gallery} name={item.name} {locale} {href} compact />
  <div class="package-body">
    <h3 itemprop="name"><a {href}>{item.name}</a></h3>
    <div class="package-facts"><span>{category}</span><span><UiIcon name="clock" />{item.duration}</span></div>
    <p class="package-route" itemprop="description"><UiIcon name="pin" /><span>{item.route}</span></p>
    <div class="package-price"><small>{c.from}</small><strong>{item.price}</strong><span>{item.unit}</span></div>
    <div class="package-actions">
      <a class="inline-book" {href} aria-label={`${c.viewDetail} ${item.name}`}>{c.viewDetail}<UiIcon name="chevron" /></a>
      <button class="package-book" type="button" on:click={onBook} aria-label={`${c.bookWhatsapp}: ${item.name}`}><UiIcon name="whatsapp" />{c.bookWhatsapp}</button>
    </div>
  </div>
</article>
