<script>
  import { tick } from 'svelte';
  import LanguageSelector from './LanguageSelector.svelte';
  import UiIcon from './UiIcon.svelte';
  import { destinationSlug, getCopy, localePath } from './i18n.js';
  import { NAV_DESTINATION_LIMIT, NAV_PACKAGE_LIMIT, groupDestinationsByRegion, pickFeatured } from './catalog-display.js';
  export let locale = 'id';
  export let suffix = '';
  export let packages = [];
  export let destinations = [];
  let menuOpen = false;
  let tourMenu;
  let destinationMenu;
  let toggle;
  let header;
  let nav;
  let lockedScrollY = 0;
  $: c = getCopy(locale);
  $: home = localePath(locale);
  $: navPackages = pickFeatured(packages, NAV_PACKAGE_LIMIT);
  $: navDestinations = pickFeatured(destinations, NAV_DESTINATION_LIMIT);
  $: navDestinationGroups = groupDestinationsByRegion(destinations);
  $: activeTours = suffix.startsWith('/paket-wisata');
  $: activeDestinations = suffix.startsWith('/destinasi');
  $: activeTravel = suffix === '/travel-lombok';
  function setMenuBackground(inert) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('main, footer, .skip-link').forEach((node) => node.toggleAttribute('inert', inert));
  }
  async function openMenu() {
    if (typeof window === 'undefined') return;
    lockedScrollY = window.scrollY;
    menuOpen = true;
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    setMenuBackground(true);
    await tick();
    nav?.querySelector('summary, nav > a')?.focus();
  }
  function closeMenu({ restoreFocus = false } = {}) {
    const wasOpen = menuOpen;
    menuOpen = false;
    if (tourMenu) tourMenu.open = false;
    if (destinationMenu) destinationMenu.open = false;
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    setMenuBackground(false);
    if (wasOpen && lockedScrollY) window.scrollTo(0, lockedScrollY);
    lockedScrollY = 0;
    if (restoreFocus) toggle?.focus();
  }
  function closeMenuAndRestore() { closeMenu({ restoreFocus: true }); }
  function toggleMenu() { menuOpen ? closeMenuAndRestore() : openMenu(); }
  function keepOneDropdown(current, other) { if (current?.open && other) other.open = false; }
  function dismiss(event) {
    if (event.type === 'click') {
      if (!header?.contains(event.target) || event.target.closest('.language-picker')) closeMenu();
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
{#if menuOpen}<button class="menu-scrim" type="button" tabindex="-1" aria-hidden="true" on:click|stopPropagation={closeMenuAndRestore}></button>{/if}
<header bind:this={header} class="site-header coastal-inner-header">
  <a class="brand brand-logo" href={home} aria-label="Wonderful Lombok" aria-current={suffix ? undefined : 'page'}><img src="/wonderful-lombok-logo-ui.png" alt="Wonderful Lombok" width="420" height="210" decoding="async" /></a>
  <div class="mobile-language"><LanguageSelector {locale} {suffix} prominent /></div>
  <button bind:this={toggle} class="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="page-navigation" on:click={toggleMenu}><span class="sr-only">{c.menu}</span><i></i><i></i></button>
  <nav id="page-navigation" bind:this={nav} class:open={menuOpen} aria-label={c.mainNav}>
    <details class="nav-dropdown" bind:this={tourMenu} on:toggle={() => keepOneDropdown(tourMenu, destinationMenu)}>
      <summary>{c.tours}</summary>
      <div class="nav-dropdown-menu">
        {#each navPackages as item}<a href={localePath(locale, `/paket-wisata/${item.slug}`)} on:click={closeMenu}><span>{item.name}</span><small>{item.duration}</small></a>{/each}
        <a class="nav-dropdown-more" href={localePath(locale, '/paket-wisata')} aria-current={activeTours ? 'page' : undefined} on:click={closeMenu}>{c.allTours}<UiIcon name="chevron" /></a>
      </div>
    </details>
    <details class="nav-dropdown" bind:this={destinationMenu} on:toggle={() => keepOneDropdown(destinationMenu, tourMenu)}>
      <summary>{c.destinations}</summary>
      <div class="nav-dropdown-menu">
        {#if navDestinationGroups.length}
          {#each navDestinationGroups as group}
            <p class="nav-dropdown-group">{c.regions[group.key]}</p>
            {#each group.items.slice(0, NAV_DESTINATION_LIMIT) as destination}<a href={localePath(locale, `/destinasi/${destinationSlug(destination)}`)} on:click={closeMenu}><span>{destination.name}</span><small>{destination.note}</small></a>{/each}
          {/each}
        {:else}
          {#each navDestinations as destination}<a href={localePath(locale, `/destinasi/${destinationSlug(destination)}`)} on:click={closeMenu}><span>{destination.name}</span><small>{destination.note}</small></a>{/each}
        {/if}
        <a class="nav-dropdown-more" href={localePath(locale, '/destinasi')} aria-current={activeDestinations ? 'page' : undefined} on:click={closeMenu}>{c.allDestinations}<UiIcon name="chevron" /></a>
      </div>
    </details>
    <a href={`${home}#hitung-travel`} aria-current={activeTravel ? 'page' : undefined} on:click={closeMenu}>{c.travel}</a>
    <a href={`${home}#faq`} on:click={closeMenu}>{c.faq}</a>
    <div class="nav-language"><LanguageSelector {locale} {suffix} /></div>
  </nav>
</header>
