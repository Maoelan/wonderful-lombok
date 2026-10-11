<p align="center">
  <a href="https://wonderful-lombok-main.vercel.app">
    <img src="./static/wonderful-lombok-logo.png" alt="Wonderful Lombok" width="360">
  </a>
</p>

<h1 align="center">Wonderful Lombok</h1>

<p align="center">
  Website multibahasa untuk paket wisata privat dan layanan antar-jemput di Lombok, lengkap dengan katalog yang dikelola admin, pemesanan WhatsApp, dan kalkulator harga berdasarkan rute.
</p>

<p align="center">
  <a href="https://wonderful-lombok-main.vercel.app">Lihat website</a>
</p>

## Tentang proyek

Wonderful Lombok adalah website full-stack berbasis SvelteKit. Pengunjung dapat melihat paket dan destinasi, menghitung estimasi perjalanan antarlokasi, lalu melanjutkan pemesanan melalui WhatsApp. Admin dapat mengelola konten, terjemahan, gambar, harga, dan pesanan tanpa mengubah kode.

Website saat ini merupakan showcase sebelum dipindahkan ke hosting dan domain resmi milik klien.

## Fitur utama

- Delapan bahasa: Indonesia, Inggris, Mandarin Sederhana, Mandarin Tradisional, Belanda, Prancis, Jerman, dan Melayu.
- Katalog paket wisata dengan galeri, itinerary, fasilitas, serta harga berdasarkan jumlah tamu.
- Daftar destinasi Lombok dengan detail dan galeri.
- Kalkulator Paket Travel dengan peta, geolokasi, rute jalan, dan estimasi tarif per kilometer.
- Pemesanan tersimpan di Convex dan dilanjutkan melalui WhatsApp.
- Admin untuk mengelola katalog, terjemahan, rich text, gambar, pengaturan kontak, dan pesanan.
- SEO dasar: metadata, canonical URL, `hreflang`, `robots.txt`, dan sitemap.
- Tampilan responsif yang diutamakan untuk perangkat mobile.
- Modul rental tetap tersedia di kode dan dapat diaktifkan melalui feature flag saat layanan siap.

## Teknologi

- SvelteKit dan Svelte 5
- Convex Database dan File Storage
- Leaflet, OpenStreetMap, Nominatim, dan OSRM
- Vercel

## Menjalankan secara lokal

Persyaratan: Node.js 22+ dan akun Convex.

```bash
git clone https://github.com/Maoelan/wonderful-lombok.git
cd wonderful-lombok
npm ci
npx convex dev --once
npm run showcase:seed
npm run admin:create
npm run dev
```

Convex akan membuat `.env.local`. Lengkapi variabel berikut jika perlu:

```env
PUBLIC_CONVEX_URL=https://deployment-anda.convex.cloud
CONVEX_SERVER_SECRET=ganti-dengan-secret-acak-yang-panjang
PUBLIC_RENTAL_ENABLED=false
BODY_SIZE_LIMIT=6M
PUBLIC_SITE_URL=http://127.0.0.1:5173
```

Buka `http://127.0.0.1:5173`. Halaman admin tersedia di `/admin`.

> [!WARNING]
> `npm run showcase:seed` mengganti katalog pada deployment Convex aktif dengan data demo dari `src/lib/catalog.js`. Jangan jalankan pada data yang ingin dipertahankan.

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

Tambahkan variabel environment yang sama pada Vercel menggunakan URL production, kemudian deploy:

```bash
npx vercel --prod
```

Jangan commit password admin, deploy key, `.env`, `.env.local`, data pelanggan, atau backup.

## Keamanan dan batasan showcase

- Password admin menggunakan scrypt dengan salt unik; token sesi hanya disimpan sebagai hash.
- Cookie sesi memakai `HttpOnly`, `SameSite=Strict`, dan `Secure` pada production.
- Endpoint admin memerlukan sesi aktif, request mutasi diperiksa origin, dan upload divalidasi.
- CSP, HSTS, `nosniff`, referrer policy, permissions policy, dan `no-store` diterapkan.
- Rate limit masih berada di memori function. Untuk trafik produksi yang besar, pindahkan ke penyimpanan bersama atau gateway khusus.
- URL file Convex digunakan hanya untuk aset publik.

## Kredit foto

Materi demo berasal dari Wikimedia Commons. Atribusi dan lisensi tersedia pada halaman sumber: [Tanjung Aan](https://commons.wikimedia.org/wiki/Category:Tanjung_Aan_Beach), [Pantai Seger](https://commons.wikimedia.org/wiki/File:PANTAI_SEGER.jpg), [Desa Sade](https://commons.wikimedia.org/wiki/File:Traditional_Sasak_Village_Sade_houses.JPG), [Tiga Gili](https://commons.wikimedia.org/wiki/Category:Gili_Islands), [Senggigi](https://commons.wikimedia.org/wiki/Category:Senggigi), serta [Rinjani dan Sembalun](https://commons.wikimedia.org/wiki/Category:Rinjani-Lombok_UNESCO_Global_Geopark).

Ganti nomor WhatsApp, email, harga, dan seluruh konten demo melalui admin sebelum website dipakai sebagai layanan bisnis resmi.
