<script>
  import { getCopy, getFormCopy } from './i18n.js';
  import { imageSrcset, imageUrl } from './image.js';
  export let images = [];
  export let name = '';
  export let locale = 'id';
  export let href = '';
  export let compact = false;
  let index = 0;
  let touchStart;
  let suppressClick = false;
  $: t = getFormCopy(locale);
  $: c = getCopy(locale);
  $: gallery = [...new Set(images.filter(Boolean))];
  $: if (!gallery.length) gallery = ['/wonderful-lombok-icon-192.png'];
  $: if (index >= gallery.length) index = 0;
  $: selected = gallery[index];
  function change(step) {
    index = (index + step + gallery.length) % gallery.length;
  }
  function choose(next) { index = next; }
  function key(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); change(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
  function start(event) {
    if (event.button !== 0 || event.target.closest('button')) return;
    suppressClick = false;
    touchStart = { x: event.clientX, y: event.clientY };
  }
  function end(event) {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClick = true; change(dx < 0 ? 1 : -1);
    }
  }
  function follow(event) { if (suppressClick) { event.preventDefault(); suppressClick = false; } }
</script>

<div class:compact class="photo-gallery" role="region" aria-label={name}>
  <div class:card-image-button={compact} class:tour-main-image={!compact} class="photo-stage" role="group" aria-label={name} on:pointerdown={start} on:pointerup={end} on:pointercancel={() => touchStart = null}>
    {#key selected}
      {#if href}<a class="photo-link" {href} draggable="false" aria-label={`${c.viewDetail}: ${name}`} on:click={follow} on:keydown={key}><img class="package-slide" src={imageUrl(selected, 640)} srcset={imageSrcset(selected, [480, 640, 800])} sizes="(max-width: 760px) 92vw, (max-width: 1000px) 45vw, 30vw" alt={name} loading="lazy" decoding="async" width="640" height="480" itemprop="image" draggable="false" /></a>
      {:else}<img class="package-slide" src={imageUrl(selected, 900)} srcset={imageSrcset(selected, [600, 900, 1200])} sizes="(max-width: 760px) 100vw, 58vw" alt={`${name}, ${c.image} ${index + 1}`} loading="eager" fetchpriority={index === 0 ? 'high' : 'auto'} decoding="async" width="900" height="650" draggable="false" />{/if}
    {/key}
    {#if gallery.length > 1}
      {#if !compact}
      <button class="photo-arrow previous" type="button" on:click={() => change(-1)} on:keydown={key} aria-label={t.previousImage}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
      <button class="photo-arrow next" type="button" on:click={() => change(1)} on:keydown={key} aria-label={t.nextImage}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
      <span class="tour-gallery-count" aria-hidden="true">{index + 1}/{gallery.length}</span>
      {:else}
      <div class="photo-indicators">{#each gallery as image, i}<button class:active={index === i} type="button" on:click={() => choose(i)} on:keydown={key} aria-label={`${c.viewImage} ${i + 1}`} aria-pressed={index === i}><span></span></button>{/each}</div>
      {/if}
      <span class="sr-only" aria-live="polite">{index + 1}/{gallery.length}</span>
    {/if}
  </div>
  {#if !compact && gallery.length > 1}<div class="tour-thumbnails">{#each gallery as image, i}<button class:active={index === i} type="button" on:click={() => choose(i)} aria-label={`${c.viewImage} ${i + 1}`} aria-pressed={index === i}><img src={imageUrl(image, 240)} alt="" loading="lazy" decoding="async" width="120" height="80" /></button>{/each}</div>{/if}
</div>
