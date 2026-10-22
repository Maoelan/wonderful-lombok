<script>
  import { page } from '$app/state';
  import { getCopy, isLocale } from '../lib/i18n.js';

  const errorCopy = {
    id: { busy: 'Situs sedang sibuk', notFound: 'Halaman tidak dapat dibuka', retry: 'Coba lagi' },
    en: { busy: 'Site is busy', notFound: 'Page unavailable', retry: 'Try again' },
    'zh-cn': { busy: '网站繁忙', notFound: '页面无法打开', retry: '重试' },
    'zh-tw': { busy: '網站繁忙', notFound: '頁面無法開啟', retry: '重試' },
    nl: { busy: 'Site is bezet', notFound: 'Pagina niet beschikbaar', retry: 'Opnieuw proberen' },
    fr: { busy: 'Le site est occupé', notFound: 'Page indisponible', retry: 'Réessayer' },
    de: { busy: 'Die Website ist ausgelastet', notFound: 'Seite nicht verfügbar', retry: 'Erneut versuchen' },
    ms: { busy: 'Laman sibuk', notFound: 'Halaman tidak tersedia', retry: 'Cuba lagi' }
  };

  const locale = $derived.by(() => {
    const first = page.url.pathname.split('/')[1];
    return isLocale(first) ? first : 'id';
  });
  const t = $derived(errorCopy[locale] || errorCopy.id);
  const homeLabel = $derived(getCopy(locale).backHome);
  const retryHref = $derived(`${page.url.pathname}${page.url.search}`);
  const message = $derived(page.error?.message || 'Terjadi kendala saat memuat halaman ini.');
</script>

<svelte:head>
  <title>{page.status === 503 ? t.busy : t.notFound}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="error-shell">
  <section class="error-card" aria-labelledby="error-title">
    <p class="error-code">{page.status}</p>
    <h1 id="error-title">{page.status === 503 ? t.busy : t.notFound}</h1>
    <p>{message}</p>
    <div class="error-actions">
      {#if page.status === 503}
        <a class="error-primary" href={retryHref}>{t.retry}</a>
      {/if}
      <a class="error-secondary" href="/">{homeLabel}</a>
    </div>
  </section>
</main>

<style>
  .error-shell {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 32px 20px;
    background: var(--cream);
    color: var(--ink);
  }

  .error-card {
    width: min(560px, 100%);
    padding: clamp(28px, 6vw, 52px);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    background: var(--paper);
    box-shadow: 0 20px 60px rgb(18 63 53 / 10%);
  }

  .error-code {
    margin: 0 0 12px;
    color: var(--accent-strong);
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  h1 {
    margin: 0 0 14px;
    font-family: var(--font-display);
    font-size: clamp(28px, 5vw, 42px);
    line-height: 1.08;
  }

  p {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 26px;
  }

  .error-actions a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 0 18px;
    border-radius: var(--radius-sm);
    font-weight: 700;
    text-decoration: none;
  }

  .error-primary {
    background: var(--forest);
    color: white;
  }

  .error-secondary {
    border: 1px solid var(--line);
    background: var(--surface-control);
    color: var(--ink);
  }
</style>
