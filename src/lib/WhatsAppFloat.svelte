<script>
  import { onMount } from 'svelte';
  import { createWhatsAppUrl } from './whatsapp.js';
  import { getFormCopy } from './i18n.js';
  export let whatsapp = '';
  export let locale = 'id';
  let suppressed = false;
  $: label = getFormCopy(locale).bookNow;
  $: message = locale !== 'id' ? 'Hello Wonderful Lombok, I would like to plan a trip in Lombok.' : 'Halo Wonderful Lombok, saya ingin merencanakan perjalanan di Lombok.';

  onMount(() => {
    const targets = [...document.querySelectorAll('[data-whatsapp-float-avoid]')];
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      suppressed = visible.size > 0;
    }, { threshold: 0.01 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  });
</script>

{#if !suppressed}
  <a class="whatsapp-float" href={createWhatsAppUrl(message, whatsapp)} target="_blank" rel="noreferrer" aria-label={`${label} · WhatsApp`}>
    <span>{label}</span><img src="/whatsapp-logo.svg" alt="" aria-hidden="true" />
  </a>
{/if}
