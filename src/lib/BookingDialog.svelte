<script>
  import { onDestroy } from 'svelte';
  import { createWhatsAppUrl } from './whatsapp.js';
  import { createIdempotencyKey } from './idempotency.js';
  import { todayInWita } from './date.js';
  import { getFormCopy } from './i18n.js';
  export let booking = null;
  export let whatsapp = '';
  export let locale = 'id';
  $: t = getFormCopy(locale);
  let name = '', phone = '', travelDate = '', people = 1, notes = '', error = '', loading = false, idempotencyKey = '', lastBookingFingerprint = '', website = '';
  const today = todayInWita();
  let bodyLocked = false, lockedScrollY = 0, savedBodyStyle = '';

  $: if (booking) lockBodyScroll();
  else unlockBodyScroll();
  onDestroy(unlockBodyScroll);

  function lockBodyScroll() {
    if (bodyLocked) return;
    lockedScrollY = window.scrollY;
    savedBodyStyle = document.body.getAttribute('style') || '';
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${lockedScrollY}px`,
      left: '0',
      right: '0',
      width: '100%',
      overflow: 'hidden',
      paddingRight: scrollbar > 0 ? `${scrollbar}px` : ''
    });
    bodyLocked = true;
  }

  function unlockBodyScroll() {
    if (!bodyLocked) return;
    document.body.setAttribute('style', savedBodyStyle);
    bodyLocked = false;
    window.scrollTo(0, lockedScrollY);
  }

  function close() { if (!loading) booking = null; }
  function focusDialog(node) {
    const previousFocus = document.activeElement;
    node.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const controls = [...node.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]')].filter((element) => element.tabIndex >= 0 && element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) { event.preventDefault(); node.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) { event.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', handleKey);
    return { destroy() { node.removeEventListener('keydown', handleKey); if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); } };
  }
  async function submit() {
    error = ''; loading = true;
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const payload = { name, whatsapp: phone, travelDate, people: Number(people), serviceType: booking.type, serviceName: booking.name, website, details: { notes } };
      const fingerprint = JSON.stringify({
        ...payload,
        name: name.trim(),
        whatsapp: phone.trim(),
        serviceName: String(booking.name ?? '').trim(),
        website: website.trim(),
        details: { notes: notes.trim() }
      });
      if (!idempotencyKey || fingerprint !== lastBookingFingerprint) {
        lastBookingFingerprint = fingerprint;
        idempotencyKey = createIdempotencyKey();
      }
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) { idempotencyKey = ''; lastBookingFingerprint = ''; }
        throw new Error(result.error);
      }
      const message = locale !== 'id' ? `Hello Wonderful Lombok, I have submitted a booking for ${booking.name}.\nCode: ${result.code}\nName: ${name}\nDate: ${travelDate}\nGuests: ${people}` : `Halo Wonderful Lombok, saya sudah membuat pemesanan ${booking.name}.\nKode: ${result.code}\nNama: ${name}\nTanggal: ${travelDate}\nPeserta: ${people} orang`;
      if (whatsappWindow) whatsappWindow.location.href = createWhatsAppUrl(message, whatsapp);
      else window.location.href = createWhatsAppUrl(message, whatsapp);
      idempotencyKey = '';
      lastBookingFingerprint = '';
      website = '';
      booking = null;
    } catch (e) { whatsappWindow?.close(); error = e.message || 'Pemesanan belum dapat disimpan.'; }
    finally { loading = false; }
  }
</script>

{#if booking}
  <div class="booking-backdrop" role="presentation" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()}>
    <div class="booking-dialog" use:focusDialog role="dialog" aria-modal="true" aria-labelledby="booking-title" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
      <button class="booking-close" type="button" on:click={close} aria-label={t.close}>×</button>
      <div class="booking-body">
        <p class="label">{t.booking}</p><h2 id="booking-title">{booking.name}</h2>
        <p>{t.bookingIntro}</p>
        <form on:submit|preventDefault={submit}>
          <div class="honeypot" aria-hidden="true"><label><span>Website</span><input bind:value={website} name="website" tabindex="-1" autocomplete="off" /></label></div>
          <label><span>{t.fullName}</span><input bind:value={name} autocomplete="name" required /></label>
          <label><span>{t.whatsapp}</span><input bind:value={phone} inputmode="tel" placeholder="0812 3456 7890" required /></label>
          <div class="form-row"><label><span>{t.travelDate}</span><input bind:value={travelDate} type="date" min={today} required /></label><label><span>{t.guests}</span><input bind:value={people} type="number" min="1" max="50" required /></label></div>
          <label><span>{t.notes}</span><textarea bind:value={notes} rows="3" placeholder={t.notesPlaceholder}></textarea></label>
          {#if error}<p class="form-message error" role="alert">{error}</p>{/if}
          <button class="submit" disabled={loading}>{loading ? t.saving : t.saveContinue}</button>
        </form>
      </div>
    </div>
  </div>
{/if}
