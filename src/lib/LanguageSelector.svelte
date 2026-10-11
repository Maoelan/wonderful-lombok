<script>
  import { onMount } from 'svelte';
  import { languages } from './i18n.js';
  export let locale = 'id';
  let selected = locale;
  $: current = languages.find((language) => language.code === selected) || languages.find((language) => language.code === 'id');

  const googleCode = (code) => ({ 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' })[code] || code;
  const sourceUrl = () => document.querySelector('link[rel="canonical"]')?.href || window.location.href;

  function chooseLanguage(code) {
    if (code === 'id') {
      window.location.assign(sourceUrl());
      return;
    }
    const destination = `https://translate.google.com/translate?sl=id&tl=${encodeURIComponent(googleCode(code))}&u=${encodeURIComponent(sourceUrl())}`;
    window.location.assign(destination);
  }

  onMount(() => {
    const translatedLanguage = new URLSearchParams(window.location.search).get('_x_tr_tl');
    selected = translatedLanguage || locale || 'id';
  });
</script>

<details class="language-picker">
  <summary aria-label="Language"><img src={`/flags/${current.flag}.png`} alt="" /><span>{current.name}</span></summary>
  <div class="language-menu">
    {#each languages as language}<button class:active={language.code === selected} type="button" on:click={() => chooseLanguage(language.code)} lang={language.hreflang}><img src={`/flags/${language.flag}.png`} alt="" /><span>{language.name}</span></button>{/each}
  </div>
</details>
