<script>
  import { onDestroy, onMount } from 'svelte';

  export let item = null;
  export let kind = 'paket';
  export let onBook = null;
  let selectedImage = '';
  let paused = false;
  let lastChanged = 0;
  let autoplayTimer;

  $: gallery = item ? [...new Set([item.image, ...(item.images || [])].filter(Boolean))] : [];
  $: selectedIndex = Math.max(0, gallery.indexOf(selectedImage));
  $: if (item && !selectedImage) selectedImage = item.image;

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoplayTimer = setInterval(() => {
      if (item && gallery.length > 1 && !paused && !document.hidden && Date.now() - lastChanged >= 5000) changeImage(1, true);
    }, 1000);
  });

  onDestroy(() => clearInterval(autoplayTimer));

  function changeImage(direction, automatic = false) {
    if (gallery.length < 2) return;
    selectedImage = gallery[(selectedIndex + direction + gallery.length) % gallery.length];
    lastChanged = automatic ? Date.now() : Date.now() + 1500;
  }

  function chooseImage(image) {
    selectedImage = image;
    lastChanged = Date.now() + 1500;
  }

  function handleKey(event) {
    if (!item) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') { event.preventDefault(); changeImage(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); changeImage(1); }
  }

  function close() {
    item = null;
    selectedImage = '';
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if item}
  <div class="detail-backdrop" role="presentation" on:click={close}>
    <div class="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
      <button class="booking-close" type="button" on:click={close} aria-label="Tutup detail">×</button>
      <div class="detail-media" role="group" aria-label="Galeri foto {item.name}" on:mouseenter={() => paused = true} on:mouseleave={() => paused = false} on:focusin={() => paused = true} on:focusout={() => paused = false}>
        <div class="detail-stage">
          {#key selectedImage}<img src={selectedImage || item.image} alt="{item.name}" />{/key}
          {#if gallery.length > 1}
            <button class="gallery-arrow previous" type="button" on:click={() => changeImage(-1)} aria-label="Gambar sebelumnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
            <button class="gallery-arrow next" type="button" on:click={() => changeImage(1)} aria-label="Gambar berikutnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
            <span class="gallery-count" aria-live="polite">{selectedIndex + 1} / {gallery.length}</span>
          {/if}
        </div>
        {#if gallery.length > 1}
          <div class="detail-thumbnails" aria-label="Galeri {item.name}">
            {#each gallery as image, index}
              <button class:active={selectedImage === image} type="button" on:click={() => chooseImage(image)} aria-label="Lihat gambar {index + 1}"><img src={image} alt="" /></button>
            {/each}
          </div>
        {/if}
      </div>
      <div class="detail-copy">
        <p class="label">Detail {kind}</p><h2 id="detail-title">{item.name}</h2>
        {#if item.detail}<p>{item.detail}</p>{/if}
        {#if item.route}<strong>{item.route}</strong>{/if}
        {#if item.price}<div class="detail-price"><b>{item.price}</b><span>{item.unit}</span></div>{/if}
        {#if onBook}<button class="submit" type="button" on:click={() => { const current = item; close(); onBook(current); }}>Pesan paket ini</button>{/if}
      </div>
    </div>
  </div>
{/if}
