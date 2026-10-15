<script>
  import { onMount } from 'svelte';

  export let rate;
  export let whatsapp;
  export let locale;

  let host;
  let Calculator;

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
    <div class="calculator-placeholder" aria-hidden="true"><span></span><span></span><span></span></div>
  {/if}
</div>
