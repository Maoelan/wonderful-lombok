<script>
  import { onDestroy, onMount, tick } from 'svelte';
  import { getCopy, getFormCopy } from './i18n.js';
  import { imageSrcset, imageUrl } from './image.js';
  export let images = [];
  export let name = '';
  export let locale = 'id';
  export let href = '';
  export let compact = false;
  const AUTOPLAY_DELAY = 5000;
  const STAGGER_DELAY = 1200;
  const FADE_DURATION = 450;
  let index = 0;
  let touchStart;
  let suppressClick = false;
  let strip;
  let root;
  let autoplayPaused = false;
  let autoplayTimer;
  let lastChanged = 0;
  let announcement = '';
  let previous = '';
  let fading = false;
  let fadeTimer;
  let fadeFrame = 0;
  let preloadTimer;
  $: t = getFormCopy(locale);
  $: c = getCopy(locale);
  $: photos = [...new Set(images.filter(Boolean))];
  $: gallery = photos.length ? photos : ['/wonderful-lombok-icon-192.png'];
  $: total = photos.length;
  $: empty = total === 0;
  $: if (index >= gallery.length) index = 0;
  $: selected = gallery[index];
  $: thumbMode = total >= 5 ? 'strip' : total >= 2 ? 'grid' : 'none';
  $: sizes = compact ? '(max-width: 760px) 92vw, (max-width: 1000px) 45vw, 30vw' : '(max-width: 760px) 100vw, 58vw';
  onMount(() => {
    if (!compact || reducedMotion()) return;
    const siblings = [...document.querySelectorAll('.package-card .photo-gallery')];
    const position = Math.max(0, siblings.indexOf(root));
    lastChanged = Date.now() + Math.min(position, 4) * STAGGER_DELAY;
    autoplayTimer = setInterval(() => {
      if (total > 1 && !autoplayPaused && !document.hidden && Date.now() - lastChanged >= AUTOPLAY_DELAY) change(1, true);
    }, 1000);
    preloadTimer = setTimeout(preloadNext, 2000);
  });
  onDestroy(() => {
    clearInterval(autoplayTimer);
    clearTimeout(fadeTimer);
    clearTimeout(preloadTimer);
    if (typeof window !== 'undefined') cancelAnimationFrame(fadeFrame);
  });
  function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function change(step, automatic = false) {
    if (total < 2) return;
    choose((index + step + total) % total, automatic);
  }
  function choose(next, automatic = false) {
    if (next === index) return;
    const outgoing = gallery[index];
    index = next;
    lastChanged = automatic ? Date.now() : Date.now() + 1500;
    if (!automatic) announcement = `${next + 1}/${total}`;
    if (!reducedMotion()) {
      previous = outgoing;
      fading = false;
      clearTimeout(fadeTimer);
      cancelAnimationFrame(fadeFrame);
      tick().then(() => {
        fadeFrame = requestAnimationFrame(() => {
          fadeFrame = requestAnimationFrame(() => {
            if (!previous) return;
            fading = true;
            fadeTimer = setTimeout(() => { previous = ''; fading = false; }, FADE_DURATION);
          });
        });
      });
    }
    preloadNext();
    tick().then(() => ensureThumbVisible(next));
  }
  function preloadNext() {
    if (total < 2) return;
    const next = gallery[(index + 1) % total];
    if (!next || next === gallery[index]) return;
    const image = new Image();
    image.sizes = sizes;
    image.srcset = imageSrcset(next, compact ? [480, 640, 800] : [600, 900, 1200]);
    image.src = imageUrl(next, compact ? 640 : 900);
  }
  function pauseAutoplay() { autoplayPaused = true; }
  function resumeAutoplay() { autoplayPaused = false; lastChanged = Date.now(); }
  function ensureThumbVisible(next) {
    if (!strip) return;
    const button = strip.querySelectorAll('button')[next];
    if (!button) return;
    const item = button.getBoundingClientRect();
    const view = strip.getBoundingClientRect();
    if (item.left < view.left || item.right > view.right) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      strip.scrollBy({ left: item.left - view.left - 8, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
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
  function follow(event) { if (suppressClick) { event.preventDefault(); suppressClick = false; return true; } return false; }
  function open(event) {
    if (!href || event.target.closest('button') || follow(event)) return;
    window.location.assign(href);
  }
  function altText(i) {
    return empty ? c.imageFallback.replace('{name}', name) : `${name}, ${c.image} ${i + 1}`;
  }
  function thumbLabel(i) {
    return c.photoOf.replace('{current}', i + 1).replace('{total}', total).replace('{name}', `${name}, ${c.image} ${i + 1}`);
  }
</script>

<div class:compact class="photo-gallery" role="region" aria-label={name} bind:this={root}>
  <div class:card-image-button={compact} class:tour-main-image={!compact} class="photo-stage" role="group" aria-label={name} on:mouseenter={pauseAutoplay} on:mouseleave={resumeAutoplay} on:focusin={pauseAutoplay} on:focusout={resumeAutoplay} on:pointerdown={start} on:pointerup={end} on:pointercancel={() => touchStart = null} on:click={open}>
    <img class="photo-layer" src={imageUrl(selected, compact ? 640 : 900)} srcset={imageSrcset(selected, compact ? [480, 640, 800] : [600, 900, 1200])} {sizes} alt={altText(index)} loading={compact || index > 0 ? 'lazy' : 'eager'} fetchpriority={index === 0 ? 'high' : 'auto'} decoding="async" width={compact ? 640 : 900} height={compact ? 427 : 675} itemprop="image" draggable="false" />
    {#if previous}
      <img class="photo-layer previous" class:fading src={imageUrl(previous, compact ? 640 : 900)} srcset={imageSrcset(previous, compact ? [480, 640, 800] : [600, 900, 1200])} {sizes} alt="" aria-hidden="true" decoding="async" draggable="false" />
    {/if}
    {#if total > 1}
      {#if !compact}
      <button class="photo-arrow previous" type="button" on:click={() => change(-1)} on:keydown={key} aria-label={t.previousImage}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
      <button class="photo-arrow next" type="button" on:click={() => change(1)} on:keydown={key} aria-label={t.nextImage}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
      {:else}
      <div class="photo-indicators">{#each gallery as image, i}<button class:active={index === i} type="button" on:click={() => choose(i)} on:keydown={key} aria-label={`${c.viewImage} ${i + 1}`} aria-pressed={index === i}><span></span></button>{/each}</div>
      {/if}
      {#if !compact}<span class="tour-gallery-count" aria-hidden="true">{index + 1}/{total}</span>{/if}
      <span class="sr-only" aria-live="polite">{announcement}</span>
    {/if}
  </div>
  {#if !compact && thumbMode !== 'none'}
    <div class:strip={thumbMode === 'strip'} class="tour-thumbnails" bind:this={strip} style={`--thumb-count:${Math.min(total, 4)}`}>
      {#each photos as image, i}
        <button class:active={index === i} type="button" on:click={() => choose(i)} aria-label={thumbLabel(i)} aria-current={index === i ? 'true' : undefined} aria-pressed={index === i}><img src={imageUrl(image, 240)} alt="" loading="lazy" decoding="async" width="120" height="80" /></button>
      {/each}
    </div>
  {/if}
</div>
