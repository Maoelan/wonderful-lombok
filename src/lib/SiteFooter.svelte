<script>
  import { getCopy, localePath } from './i18n.js';
  import { formatWhatsAppNumber } from './whatsapp.js';
  import UiIcon from './UiIcon.svelte';
  export let settings;
  export let locale = 'id';
  export let rentalEnabled = false;
  export let homepage = false;
  $: c = getCopy(locale);
  $: home = localePath(locale);
</script>

<footer id="kontak" class="travel-footer" data-whatsapp-float-avoid>
  <div class="travel-footer-main">
    <div class="travel-footer-brand"><a href={home}><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="180" height="90" loading="lazy" /></a><p>{c.localPartner}</p></div>
    <nav aria-label={c.menu}><a href={homepage ? '#paket' : localePath(locale, '/paket-wisata')}>{c.tours}</a><a href={`${home}#hitung-travel`}>{c.travel}</a>{#if rentalEnabled}<a href={`${home}#rental`}>{c.rentalLabel}</a>{/if}<a href={`${home}#destinasi`}>{c.destinations}</a><a href={`${home}#faq`}>{c.faq}</a></nav>
    <div class="travel-footer-contact"><strong>{c.contact}</strong>{#if settings.whatsapp}<a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><img src="/whatsapp-logo.svg" width="20" height="20" alt="" />{formatWhatsAppNumber(settings.whatsapp)}</a>{/if}{#if settings.email}<a href={`mailto:${settings.email}`}><UiIcon name="mail" />{settings.email}</a>{/if}{#if settings.location}<p><UiIcon name="pin" />{settings.location}</p>{/if}</div>
  </div>
  {#if settings.instagram || settings.tiktok || settings.facebook}<div class="travel-footer-bottom"><div class="social-links">{#if settings.instagram}<a href={settings.instagram} target="_blank" rel="noreferrer"><UiIcon name="instagram" />Instagram</a>{/if}{#if settings.tiktok}<a href={settings.tiktok} target="_blank" rel="noreferrer"><UiIcon name="tiktok" />TikTok</a>{/if}{#if settings.facebook}<a href={settings.facebook} target="_blank" rel="noreferrer"><UiIcon name="facebook" />Facebook</a>{/if}</div></div>{/if}
</footer>
