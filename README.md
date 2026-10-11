# Wonderful Lombok

Website showcase full-stack SvelteKit untuk Paket Wisata, Paket Travel, rental kendaraan, dan pengelolaan konten. Frontend/SSR berjalan di Vercel, sedangkan katalog, pemesanan, akun admin, sesi, dan file upload disimpan di Convex.

## Menjalankan di perangkat baru

Persyaratan: Node.js 22+, akun Convex, dan akun Vercel untuk deployment.

```bash
git clone https://github.com/Maoelan/wonderful-lombok.git
cd wonderful-lombok
npm ci
npx convex dev --once
npm run showcase:seed
npm run admin:create
npm run dev
```

Convex membuat `.env.local` secara otomatis. Jika diatur manual:

```env
PUBLIC_CONVEX_URL=https://deployment-anda.convex.cloud
PUBLIC_SITE_URL=http://127.0.0.1:5173
BODY_SIZE_LIMIT=6M
```

Buka `http://127.0.0.1:5173`. Admin tersedia di `/admin`. `npm run showcase:seed` mengganti katalog deployment aktif dengan data demo bersih dari `src/lib/catalog.js`; jangan jalankan pada data yang ingin dipertahankan.

## Pemeriksaan

```bash
npm test
npm run build
```

## Deployment

Terbitkan fungsi Convex:

```bash
npx convex deploy
```

Di Vercel, tambahkan environment variable Production:

- `PUBLIC_CONVEX_URL=https://deployment-production.convex.cloud`
- `PUBLIC_SITE_URL=https://domain-website-anda`
- `BODY_SIZE_LIMIT=6M`

Kemudian deploy dengan `npx vercel --prod`. Hubungkan repository GitHub agar push berikutnya otomatis membuat deployment baru. Lihat [dokumentasi SvelteKit Vercel](https://vercel.com/docs/frameworks/full-stack/sveltekit) dan [deployment Convex](https://docs.convex.dev/cli/reference/deploy).

## Implementasi

- Website publik bilingual Indonesia/Inggris dengan canonical, `hreflang`, dan sitemap.
- Detail Paket Wisata berisi galeri, itinerary, fasilitas, dan harga berdasarkan jumlah tamu.
- Admin mengatur konten bilingual, paket, destinasi, rental, FAQ, kontak, pemesanan, tarif travel, dan gambar.
- Upload JPG, PNG, atau WebP maksimal 5 MB disimpan di Convex File Storage.
- Pemesanan disimpan di Convex lalu dilanjutkan melalui WhatsApp.
- Rute Paket Travel memakai OpenStreetMap/Nominatim dan OSRM, dibatasi ke Pulau Lombok.
- Floating CTA “Pesan Sekarang”/“Book Now” memakai nomor WhatsApp dari admin.

## Konten showcase

Foto demo Lombok/Gili menggunakan lisensi Creative Commons dari Wikimedia Commons. Atribusi tersedia pada halaman sumber: [Tanjung Aan](https://commons.wikimedia.org/wiki/File:Tanjung_Aan,_Lombok.jpg), [Gili Trawangan](https://commons.wikimedia.org/wiki/File:Gili_Trawangan.jpeg), dan [Sunset over Lombok Strait](https://commons.wikimedia.org/wiki/File:Gili_Trawangan_Island,_View_of_Bali_and_Agung_Volcano,_Sunset_over_Lombok_Strait,_Indonesia.jpg).

Ganti nomor WhatsApp, email, harga, dan konten demo melalui admin sebelum dipakai sebagai website bisnis resmi.

## Keamanan dan batasan showcase

- Password admin menggunakan scrypt dengan salt unik; token sesi hanya disimpan sebagai hash.
- Cookie sesi memakai `HttpOnly`, `SameSite=Strict`, dan `Secure` pada production.
- Endpoint admin memerlukan sesi aktif, request mutasi diperiksa origin, dan upload divalidasi sebelum dikirim ke Convex.
- CSP, HSTS, `nosniff`, referrer policy, permissions policy, dan `no-store` diterapkan.
- Rate limit masih berada di memori function. Untuk trafik nyata, pindahkan ke Convex atau gateway khusus.
- URL file Convex bersifat bearer URL; gunakan hanya untuk aset publik.
- Jangan commit password, deploy key, `.env`, `.env.local`, data pelanggan, atau backup.
- Tidak ada aplikasi yang dapat dijamin bebas dari seluruh celah keamanan. Jalankan audit, tes, dan build pada setiap rilis.
