<script>
  import { imageSrcset, imageUrl } from './image.js';
  import { destinationSlug, localePath } from './i18n.js';
  export let item;
  export let locale = 'id';
  const fallbackImage = '/wonderful-lombok-icon-192.png';
  $: image = item.image || fallbackImage;
</script>

<a class="destination-card" href={localePath(locale, `/destinasi/${destinationSlug(item)}`)}>
  <img src={imageUrl(image, 640)} srcset={imageSrcset(image, [480, 640, 800])} sizes="(max-width: 760px) 46vw, (max-width: 1000px) 46vw, 31vw" alt="" loading="lazy" decoding="async" width="720" height="500" />
  <div><h3>{item.name}</h3><p>{item.note}</p></div>
</a>
