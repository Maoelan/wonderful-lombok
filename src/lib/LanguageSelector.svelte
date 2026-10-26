<script>
  import { getCopy, languages, localePath } from './i18n.js';
  export let locale = 'id';
  export let suffix = '';
  export let prominent = false;
  let picker;
  function dismiss(event) {
    if (!picker?.open) return;
    if (event.type === 'keydown') {
      if (event.key === 'Escape') { picker.open = false; picker.querySelector('summary')?.focus(); }
    } else if (!picker.contains(event.target)) picker.open = false;
  }
  $: current = languages.find((language) => language.code === locale) || languages.find((language) => language.code === 'id');
  $: copy = getCopy(locale);
</script>

<svelte:window on:click={dismiss} on:keydown={dismiss} />
<details bind:this={picker} class:prominent class="language-picker">
  <summary aria-label={`${copy.language}: ${current.name}`}>
    <img src={`/flags/${current.flag}.png`} alt="" />
    <span>{current.name}</span>
  </summary>
  <div class="language-menu">
    {#each languages as language}<a class:active={language.code === locale} href={localePath(language.code, suffix)} hreflang={language.hreflang}><img src={`/flags/${language.flag}.png`} alt="" /><span>{language.name}</span></a>{/each}
  </div>
</details>
