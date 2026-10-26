<script>
  import LanguageSelector from './LanguageSelector.svelte';
  import { getCopy, localePath } from './i18n.js';
  export let locale = 'id';
  export let suffix = '';
  let menuOpen = false;
  let toggle;
  let header;
  $: c = getCopy(locale);
  $: home = localePath(locale);
  function dismiss(event) {
    if (event.type === 'click') {
      if (!header?.contains(event.target) || event.target.closest('.language-picker')) menuOpen = false;
      return;
    }
    if (event.key === 'Escape' && menuOpen) { menuOpen = false; toggle?.focus(); }
  }
</script>

<svelte:window on:keydown={dismiss} on:click={dismiss} />
<header bind:this={header} class="site-header coastal-inner-header">
  <a class="brand brand-logo" href={home} aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
  <div class="mobile-language"><LanguageSelector {locale} {suffix} prominent /></div>
  <button bind:this={toggle} class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="page-navigation" on:click={() => menuOpen = !menuOpen}><span class="sr-only">{c.menu}</span><i></i><i></i></button>
  <nav id="page-navigation" class:open={menuOpen} aria-label={c.menu}>
    <a href={localePath(locale, '/paket-wisata')} on:click={() => menuOpen = false}>{c.tours}</a>
    <a href={`${home}#destinasi`} on:click={() => menuOpen = false}>{c.destinations}</a>
    <a href={localePath(locale, '/travel-lombok')} on:click={() => menuOpen = false}>{c.travel}</a>
    <a href={`${home}#faq`} on:click={() => menuOpen = false}>{c.faq}</a>
    <div class="nav-language"><LanguageSelector {locale} {suffix} /></div>
  </nav>
</header>
