<script>
  import { createWhatsAppUrl } from './whatsapp.js';
  export let whatsapp = '';
  export let locale = 'id';
  $: label = locale !== 'id' ? 'Book Now' : 'Pesan Sekarang';
  $: message = locale !== 'id' ? 'Hello Wonderful Lombok, I would like to plan a trip in Lombok.' : 'Halo Wonderful Lombok, saya ingin merencanakan perjalanan di Lombok.';
</script>

<a class="whatsapp-float" href={createWhatsAppUrl(message, whatsapp)} target="_blank" rel="noreferrer" aria-label={`${label} melalui WhatsApp`}>
  <span>{label}</span><b aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a12 12 0 0 0 5.4 1.3c6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.4-8.3Zm-8.4 18a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 1 1 8.4 4.7Zm5.3-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.6l-.9-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.1.2 2.5 3.8 6 5.3 2.2.9 3 .9 4.1.8 1.3-.2 2.3-1 2.6-1.9.3-.9.3-1.6.2-1.8-.1-.3-.3-.4-.6-.5Z"/></svg></b>
</a>
