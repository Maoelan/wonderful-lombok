<script>
  import LanguageSelector from './LanguageSelector.svelte';
  import { destinationSlug, getCopy, localePath } from './i18n.js';
  export let locale = 'id';
  export let suffix = '';
  export let packages = [];
  export let destinations = [];
  let menuOpen = false;
  let tourMenu;
  let destinationMenu;
  let toggle;
  let header;
  $: c = getCopy(locale);
  $: home = localePath(locale);
  $: onToursPage = suffix === '/paket-wisata' || suffix.startsWith('/paket-wisata/');
  $: onDestinationsPage = suffix.startsWith('/destinasi/');
  function closeMenu() {
    menuOpen = false;
    if (tourMenu) tourMenu.open = false;
    if (destinationMenu) destinationMenu.open = false;
  }
  function keepOneDropdown(current, other) { if (current?.open && other) other.open = false; }
  function dismiss(event) {
    if (event.type === 'click') {
      if (!header?.contains(event.target) || event.target.closest('.language-picker')) menuOpen = false;
      if (event.target instanceof Element && event.target.closest('.nav-dropdown')) return;
      if (tourMenu) tourMenu.open = false;
      if (destinationMenu) destinationMenu.open = false;
      return;
    }
    if (event.key === 'Escape') {
      const control = menuOpen ? toggle : tourMenu?.open ? tourMenu.querySelector('summary') : destinationMenu?.open ? destinationMenu.querySelector('summary') : null;
      closeMenu();
      control?.focus();
    }
  }
</script>

<svelte:window on:keydown={dismiss} on:click={dismiss} />
<header bind:this={header} class="site-header coastal-inner-header">
  <a class="brand brand-logo" href={home} aria-label="Wonderful Lombok"><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
  <div class="mobile-language"><LanguageSelector {locale} {suffix} prominent /></div>
  <button bind:this={toggle} class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="page-navigation" on:click={() => menuOpen ? closeMenu() : menuOpen = true}><span class="sr-only">{c.menu}</span><i></i><i></i></button>
  <nav id="page-navigation" class:open={menuOpen} aria-label={c.menu}>
    {#if onToursPage}
    <a href={localePath(locale, '/paket-wisata')} on:click={closeMenu}>{c.tours}</a>
    {:else}
    <details class="nav-dropdown" bind:this={tourMenu} on:toggle={() => keepOneDropdown(tourMenu, destinationMenu)}>
      <summary>{c.tours}</summary>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-all" href={localePath(locale, '/paket-wisata')} on:click={closeMenu}>{c.allTours}</a>
        {#each packages as item}<a href={localePath(locale, `/paket-wisata/${item.slug}`)} on:click={closeMenu}><span>{item.name}</span><small>{item.duration}</small></a>{/each}
      </div>
    </details>
    {/if}
    {#if onDestinationsPage}
    <a href={`${home}#destinasi`} on:click={closeMenu}>{c.destinations}</a>
    {:else}
    <details class="nav-dropdown" bind:this={destinationMenu} on:toggle={() => keepOneDropdown(destinationMenu, tourMenu)}>
      <summary>{c.destinations}</summary>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-all" href={`${home}#destinasi`} on:click={closeMenu}>{c.destinationLabel}</a>
        {#each destinations as destination}<a href={localePath(locale, `/destinasi/${destinationSlug(destination)}`)} on:click={closeMenu}><span>{destination.name}</span><small>{destination.note}</small></a>{/each}
      </div>
    </details>
    {/if}
    <a href={localePath(locale, '/travel-lombok')} on:click={closeMenu}>{c.travel}</a>
    <a href={`${home}#faq`} on:click={closeMenu}>{c.faq}</a>
    <div class="nav-language"><LanguageSelector {locale} {suffix} /></div>
  </nav>
</header>
