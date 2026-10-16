<script>
  import '../app.css';
  export let data;
</script>

<svelte:head>
  {#if data.googleSiteVerification}<meta name="google-site-verification" content={data.googleSiteVerification} />{/if}
  {#if data.bingSiteVerification}<meta name="msvalidate.01" content={data.bingSiteVerification} />{/if}
</svelte:head>

<slot />
