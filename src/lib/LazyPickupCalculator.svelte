<script>
  import { onMount } from 'svelte';
  import { getFormCopy } from './i18n.js';

  export let rate;
  export let whatsapp;
  export let locale;

  let host;
  let Calculator;
  $: loadingCopy = getFormCopy(locale);

  onMount(() => {
    let cancelled = false;
    const load = async () => {
      if (Calculator || cancelled) return;
      const module = await import('./PickupCalculator.svelte');
      if (!cancelled) Calculator = module.default;
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      load();
    }, { rootMargin: '600px 0px' });
    observer.observe(host);
    return () => { cancelled = true; observer.disconnect(); };
  });
</script>

<div bind:this={host}>
  {#if Calculator}
    <svelte:component this={Calculator} {rate} {whatsapp} {locale} />
  {:else}
    <div class="calculator-placeholder" role="status"><span class="spinner" aria-hidden="true"></span><p>{loadingCopy.loadingMap}</p></div>
  {/if}
</div>
