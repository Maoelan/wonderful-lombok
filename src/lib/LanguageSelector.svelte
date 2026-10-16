<script>
  import { getCopy, languages, localePath } from './i18n.js';
  export let locale = 'id';
  export let suffix = '';
  export let prominent = false;
  $: current = languages.find((language) => language.code === locale) || languages.find((language) => language.code === 'id');
  $: copy = getCopy(locale);
</script>

<details class:prominent class="language-picker">
  <summary aria-label={`${copy.language}: ${current.name}`}>
    <img src={`/flags/${current.flag}.png`} alt="" />
    <span>{current.name}</span>
  </summary>
  <div class="language-menu">
    {#each languages as language}<a class:active={language.code === locale} href={localePath(language.code, suffix)} hreflang={language.hreflang}><img src={`/flags/${language.flag}.png`} alt="" /><span>{language.name}</span></a>{/each}
  </div>
</details>
