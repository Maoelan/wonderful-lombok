<script>export let form;</script>
<svelte:head><title>Login Admin | Wonderful Lombok</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<main class="login-page">
  <section class="login-panel">
    <a class="admin-brand" href="/"><span>Wonderful</span><b>Lombok</b></a>
    <div><p class="admin-kicker">Area pengelola</p><h1>Masuk ke admin.</h1><p>Gunakan akun admin untuk mengubah informasi yang tampil di website.</p></div>
    <form method="POST">
      <label><span>Username</span><input name="username" autocomplete="username" value={form?.username ?? ''} required /></label>
      <label><span>Password</span><input name="password" type="password" autocomplete="current-password" required /></label>
      {#if form?.error}<p class="form-message error" role="alert">{form.error}</p>{/if}
      <button class="admin-save" type="submit">Masuk ke dashboard</button>
    </form>
    <a class="login-back" href="/">Kembali ke website</a>
  </section>
</main>
