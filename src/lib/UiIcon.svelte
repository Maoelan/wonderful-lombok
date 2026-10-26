<script>
  export let name = 'arrow';
</script>

<svg class="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if name === 'palm'}
    <path d="M10 20c2-5 3-9 3-14 M13 6C9 2 5 4 3 7c4-1 7-1 10-1Zm0 0c3-4 7-3 9 0-4-1-6-1-9 0Zm0 0c-5 0-7 4-7 7 2-3 4-5 7-7Zm0 0c4 1 6 4 6 7-2-3-4-5-6-7ZM2 21c6-3 13-3 20 0" />
  {:else if name === 'chevron'}
    <path d="m9 5 7 7-7 7" />
  {:else if name === 'tour'}
    <path d="m3 19 6-11 4 6 3-4 5 9H3Z M9 8l2-4 3 5" />
  {:else if name === 'travel'}
    <path d="m5 10 2-5h10l2 5 M4 10h16v8H4z M7 18v2 M17 18v2 M7 14h1 M16 14h1" />
  {:else if name === 'rental'}
    <path d="M4 16V9l2-4h12l2 4v7 M4 12h16 M7 16h.01 M17 16h.01" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
  {:else if name === 'pin'}
    <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  {:else if name === 'overview'}
    <path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" />
  {:else if name === 'booking'}
    <rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4 M16 3v4 M4 11h16 M8 15h3 M8 18h6" />
  {:else if name === 'faq'}
    <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 17h.01" /><circle cx="12" cy="12" r="9" />
  {:else if name === 'settings'}
    <path d="M4 7h16 M4 17h16 M8 4v6 M16 14v6" />
  {:else if name === 'instagram'}
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" />
  {:else if name === 'facebook'}
    <path d="M14 21v-9h3l.5-4H14V6c0-1 1-2 2-2h2V1h-3c-3 0-5 2-5 5v2H7v4h3v9" />
  {:else if name === 'tiktok'}
    <path d="M14 3v12a4 4 0 1 1-4-4 M14 3c1 4 3 5 6 5" />
  {:else if name === 'mail'}
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" />
  {:else}
    <path d="M4 12h16 M14 6l6 6-6 6" />
  {/if}
</svg>
