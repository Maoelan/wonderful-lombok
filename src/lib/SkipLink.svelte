<script>
  import { getCopy } from './i18n.js';
  export let locale = 'id';
  $: c = getCopy(locale);
</script>

<a class="skip-link" href="#main-content">{c.skipToContent}</a>
