<script>
  import { getCopy, localePath } from './i18n.js';
  import { formatWhatsAppNumber } from './whatsapp.js';
  import UiIcon from './UiIcon.svelte';
  export let settings;
  export let locale = 'id';
  export let rentalEnabled = false;
  export let homepage = false;
  export let current = '';
  $: c = getCopy(locale);
  $: home = localePath(locale);
  $: year = new Date().getFullYear();
  $: hasSocial = Boolean(settings.instagram || settings.tiktok || settings.facebook);
</script>

<footer id="kontak" class="travel-footer">
  <div class="travel-footer-main">
    <div class="travel-footer-brand"><a href={home} aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-footer.png" alt="Wonderful Lombok" width="287" height="183" loading="lazy" /></a><p>{c.localPartner}</p></div>
    <nav class="travel-footer-nav" aria-labelledby="footer-nav-title">
      <h2 class="travel-footer-title" id="footer-nav-title">{c.footerExplore}</h2>
      <div class="travel-footer-list">
        <a href={homepage ? '#paket' : localePath(locale, '/paket-wisata')} aria-current={current === 'tours' ? 'page' : undefined}>{c.tours}</a>
        <a href={`${home}#hitung-travel`} aria-current={current === 'travel' ? 'page' : undefined}>{c.travel}</a>
        {#if rentalEnabled}<a href={`${home}#rental`}>{c.rentalLabel}</a>{/if}
        <a href={`${home}#destinasi`} aria-current={current === 'destinations' ? 'page' : undefined}>{c.destinations}</a>
        <a href={`${home}#faq`}>{c.faq}</a>
      </div>
    </nav>
    <section class="travel-footer-contact" aria-labelledby="footer-contact-title">
      <h2 class="travel-footer-title" id="footer-contact-title">{c.contact}</h2>
      <div class="travel-footer-list">
        {#if settings.whatsapp}<a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><img src="/whatsapp-logo.svg" width="20" height="20" alt="" />{formatWhatsAppNumber(settings.whatsapp)}</a>{/if}
        {#if settings.email}<a href={`mailto:${settings.email}`}><UiIcon name="mail" />{settings.email}</a>{/if}
        {#if settings.location}<p><UiIcon name="pin" />{settings.location}</p>{/if}
      </div>
    </section>
  </div>
  {#if hasSocial}<div class="travel-footer-bottom"><div class="social-links">{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer"><UiIcon name="instagram" />Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer"><UiIcon name="tiktok" />TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer"><UiIcon name="facebook" />Facebook</a>{/if}</div></div>{/if}
  <p class="travel-footer-legal">© {year} Wonderful Lombok</p>
</footer>
