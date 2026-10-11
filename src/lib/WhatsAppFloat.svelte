<script>
  import { createWhatsAppUrl } from './whatsapp.js';
  export let whatsapp = '';
  export let locale = 'id';
  $: label = locale !== 'id' ? 'Book Now' : 'Pesan Sekarang';
  $: message = locale !== 'id' ? 'Hello Wonderful Lombok, I would like to plan a trip in Lombok.' : 'Halo Wonderful Lombok, saya ingin merencanakan perjalanan di Lombok.';
</script>

<a class="whatsapp-float" href={createWhatsAppUrl(message, whatsapp)} target="_blank" rel="noreferrer" aria-label={`${label} melalui WhatsApp`}>
  <span>{label}</span><img src="/whatsapp-logo.svg" alt="" aria-hidden="true" />
</a>
