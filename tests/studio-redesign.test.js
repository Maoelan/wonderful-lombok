import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { packageBooking } from '../src/lib/booking-context.js';
const source = path => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');

test('tour cards share the original booking entry point across public catalogue surfaces', () => {
  for (const path of ['routes/+page.svelte','routes/[lang]/paket-wisata/+page.svelte','routes/[lang]/destinasi/[slug]/+page.svelte']) {
    const s=source(path);
    assert.match(s, /<TourCard/);
    assert.match(s, /booking = packageBooking\(item\)/);
    assert.match(s, /<BookingDialog/);
  }
  const card=source('lib/TourCard.svelte');
  for(const field of ['item.name','item.price','item.unit','item.duration','item.route'])assert.ok(card.includes(field));
  assert.match(card, /PhotoGallery/);
});

test('booking images and routes are display context, not a new booking price or submission field', () => {
  const context=packageBooking({name:'Lombok',image:'/uploads/actual.webp',route:'Kuta → Sade',price:'Rp1.250.000',unit:'per kendaraan',duration:'1 hari',estimatedPrice:1});
  assert.equal(context.image,'/uploads/actual.webp');
  assert.equal(context.route,'Kuta → Sade');
  assert.equal(context.estimatedPrice,undefined);
  const s=source('lib/BookingDialog.svelte');
  const payload=s.slice(s.indexOf('const payload ='),s.indexOf('const fingerprint ='));
  assert.doesNotMatch(payload,/booking\.(image|route|price)|estimatedPrice/);
  assert.match(s,/fetch\('\/api\/bookings'/);
  assert.match(s,/idempotency-key/);
  assert.match(s,/createWhatsAppUrl\(message, whatsapp\)/);
});

test('admin redesigned catalogue and grouped editors keep the real save and upload contracts', () => {
  const s=source('routes/admin/+page.svelte');
  for(const id of ['package-info','package-pricing','package-itinerary','package-gallery','destination-info','destination-related','destination-gallery'])assert.equal((s.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,id);
  assert.match(s,/if index === Math\.min\(selectedPackage/);
  assert.match(s,/if index === Math\.min\(selectedDestination/);
  assert.match(s,/if !packageEditorOpen/);
  assert.match(s,/if !destinationEditorOpen/);
  assert.match(s,/expectedRevision: catalogRevision/);
  assert.match(s,/response.status === 409/);
  assert.match(s,/fetch\('\/api\/admin\/catalog'/);
  assert.match(s,/fetch\('\/api\/admin\/upload'/);
  assert.match(s,/setPackageDestination\(packageIndex, item.slug/);
  assert.match(s,/leaveGuard.beforeUnload/);
  assert.doesNotMatch(s,/localStorage|WL-DEMO-|Pelanggan contoh/);
});

test('redesign retains homepage map and original public compatibility routes', () => {
  const home=source('routes/+page.svelte');
  assert.equal((home.match(/id="hitung-travel"/g)||[]).length,1);
  assert.match(home,/<LazyPickupCalculator/);
  assert.match(home,/href="#hitung-travel"/);
  assert.match(source('lib/SiteHeader.svelte'),/#hitung-travel/);
  assert.ok(source('routes/[lang]/travel-lombok/+page.svelte').includes('LazyPickupCalculator'));
});
