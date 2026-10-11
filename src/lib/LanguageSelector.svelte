<script>
  import { goto } from '$app/navigation';
  import { languages, localePath } from './i18n.js';
  export let locale = 'id';
  export let suffix = '';
  function change(event) { goto(localePath(event.currentTarget.value, suffix)); }
</script>

<label class="language-picker">
  <span class="sr-only">Language</span>
  <select value={locale} on:change={change} aria-label="Language">
    {#each languages as language}
      <option value={language.code}>{language.flag} {language.name}</option>
    {/each}
  </select>
</label>
