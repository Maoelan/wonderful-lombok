<script>
  import { createWhatsAppUrl } from './whatsapp.js';
  export let booking = null;
  export let whatsapp = '';
  let name = '', phone = '', travelDate = '', people = 1, notes = '', error = '', loading = false;
  const today = new Date().toISOString().slice(0, 10);

  function close() { if (!loading) booking = null; }
  async function submit() {
    error = ''; loading = true;
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, whatsapp: phone, travelDate, people: Number(people), serviceType: booking.type, serviceName: booking.name, details: { notes } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const message = `Halo Wonderful Lombok, saya sudah membuat pemesanan ${booking.name}.\nKode: ${result.code}\nNama: ${name}\nTanggal: ${travelDate}\nPeserta: ${people} orang`;
      if (whatsappWindow) whatsappWindow.location.href = createWhatsAppUrl(message, whatsapp);
      else window.location.href = createWhatsAppUrl(message, whatsapp);
      booking = null;
    } catch (e) { whatsappWindow?.close(); error = e.message || 'Pemesanan belum dapat disimpan.'; }
    finally { loading = false; }
  }
</script>

{#if booking}
  <div class="booking-backdrop" role="presentation" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()}>
    <div class="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
      <button class="booking-close" type="button" on:click={close} aria-label="Tutup formulir">×</button>
      <p class="label">Permintaan pemesanan</p><h2 id="booking-title">{booking.name}</h2>
      <p>Isi data singkat berikut. Setelah tersimpan, lanjutkan konfirmasi melalui WhatsApp.</p>
      <form on:submit|preventDefault={submit}>
        <label><span>Nama lengkap</span><input bind:value={name} autocomplete="name" required /></label>
        <label><span>Nomor WhatsApp</span><input bind:value={phone} inputmode="tel" placeholder="0812 3456 7890" required /></label>
        <div class="form-row"><label><span>Tanggal perjalanan</span><input bind:value={travelDate} type="date" min={today} required /></label><label><span>Jumlah peserta</span><input bind:value={people} type="number" min="1" max="50" required /></label></div>
        <label><span>Catatan opsional</span><textarea bind:value={notes} rows="3" placeholder="Permintaan khusus atau lokasi penjemputan"></textarea></label>
        {#if error}<p class="form-message error" role="alert">{error}</p>{/if}
        <button class="submit" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan dan lanjut ke WhatsApp'}</button>
      </form>
    </div>
  </div>
{/if}
