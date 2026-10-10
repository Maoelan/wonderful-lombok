# Wonderful Lombok

Aplikasi full-stack SvelteKit untuk paket wisata, Paket Travel, rental, dan pengelolaan konten melalui admin.

## Kebutuhan perangkat

- Node.js 22 atau lebih baru
- PostgreSQL 15 atau lebih baru
- Git

## Menjalankan di perangkat baru

```bash
git clone https://github.com/Maoelan/wonderful-lombok.git
cd wonderful-lombok
npm ci
```

Salin `.env.example` menjadi `.env`, lalu isi koneksi PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wonderful_lombok
BODY_SIZE_LIMIT=6M
PUBLIC_SITE_URL=http://127.0.0.1:5173
```

File `.env` sudah dikecualikan dari Git. `BODY_SIZE_LIMIT` memberi ruang untuk upload gambar 5 MB sambil tetap membatasi ukuran request. `PUBLIC_SITE_URL` dipakai untuk canonical URL, Open Graph, robots.txt, dan sitemap.

Pastikan PostgreSQL berjalan dan user pada `DATABASE_URL` memiliki izin membuat database untuk inisialisasi pertama. Kemudian jalankan:

```bash
npm run db:init
npm run admin:create
npm run dev
```

Buka `http://127.0.0.1:5173`. Admin tersedia di `/admin`, dan pengguna yang belum login diarahkan ke `/login`.

Untuk mengakses development server dari perangkat lain pada jaringan lokal:

```bash
npm run dev -- --host 0.0.0.0
```

Buka `http://IP-KOMPUTER:5173` dari perangkat lain. Jangan mengekspos development server langsung ke internet.

Konfigurasi lokal disimpan di `.env` dan tidak masuk version control. Akun admin dibuat atau diubah melalui `npm run admin:create`; username dan hash password disimpan langsung di PostgreSQL, bukan di environment variable. Gunakan password unik minimal 12 karakter dan jangan samakan dengan password PostgreSQL.

## Pemeriksaan

```bash
npm test
npm run test:auth
npm run test:booking
npm run build
```

## Menjalankan production

```bash
npm ci
npm run db:init
npm run admin:create
npm run build
NODE_ENV=production npm start
```

Pada Windows PowerShell, gunakan `$env:NODE_ENV='production'; npm start`. Tempatkan aplikasi di belakang reverse proxy HTTPS seperti Caddy atau Nginx. HTTPS diperlukan agar cookie admin memakai atribut `Secure`.

Environment production minimum:

- `DATABASE_URL`
- `BODY_SIZE_LIMIT=6M`
- `PUBLIC_SITE_URL=https://domain-anda.com`
- `NODE_ENV=production`

Gunakan nilai HTTPS tanpa path untuk `PUBLIC_SITE_URL`. Setelah domain aktif, daftarkan `${PUBLIC_SITE_URL}/sitemap.xml` ke Google Search Console. Peringkat pencarian tidak dapat dijamin karena juga dipengaruhi kualitas konten, kompetisi, backlink, performa hosting, dan riwayat domain.

Jika reverse proxy meneruskan host atau protokol internal yang berbeda dari URL publik, atur `PROTOCOL_HEADER=x-forwarded-proto` dan `HOST_HEADER=x-forwarded-host`, lalu pastikan proxy menimpa kedua header tersebut. Jangan menerima header forwarded langsung dari internet tanpa proxy tepercaya.

Jalankan aplikasi menggunakan process manager atau service manager, bukan terminal interaktif. Batasi akses PostgreSQL hanya dari server aplikasi dan lakukan backup berkala.

## Implementasi

- Katalog dan informasi website disimpan sebagai JSONB di PostgreSQL.
- Password admin disimpan sebagai hash scrypt dengan salt terpisah.
- Session admin memakai token acak yang disimpan dalam bentuk hash dan cookie `HttpOnly`.
- Halaman publik membaca data terbaru langsung dari PostgreSQL.
- Admin dapat mengatur Paket Wisata dan Destinasi beserta detail serta galerinya, FAQ, tarif Paket Travel, Rental, kontak, teks utama, dan media sosial.
- Admin dapat mengunggah JPG, PNG, atau WebP maksimal 5 MB. File disajikan melalui endpoint gambar dengan nama acak.
- Jarak Paket Travel mengikuti rute berkendara OSRM pada peta Leaflet dan OpenStreetMap. Pencarian alamat dibatasi ke Pulau Lombok; lokasi juga dapat dipilih melalui pembacaan GPS berakurasi tinggi, lokasi populer, atau klik langsung pada peta.
- Pemesanan disimpan ke database lalu ringkasannya langsung dibuka di WhatsApp bisnis yang dikonfigurasi admin.

## Batas lokal

- Routing membutuhkan koneksi internet ke layanan publik OSRM dan OpenStreetMap.
- Pencarian alamat membutuhkan koneksi ke Nominatim OpenStreetMap. Untuk trafik production yang tinggi, gunakan penyedia geocoding sendiri atau layanan berbayar sesuai kebijakan pemakaian.
- Folder `uploads/` harus dipasang pada storage persisten saat deployment container atau serverless, dan perlu ikut strategi backup.
- Untuk deployment HTTPS, jalankan hasil adapter Node dengan `NODE_ENV=production` agar cookie session memakai atribut `Secure`.

## Keamanan

- Password admin di-hash dengan scrypt dan salt unik.
- Token session acak hanya disimpan sebagai hash di database.
- Cookie session memakai `HttpOnly`, `SameSite=Strict`, dan `Secure` pada production.
- Login dan guest booking memiliki rate limit dasar.
- Endpoint admin memerlukan session aktif dan request mutasi memakai pemeriksaan origin.
- Content Security Policy memakai nonce untuk script, serta header HSTS, `nosniff`, referrer policy, permissions policy, dan no-store untuk halaman privat.
- Upload dibatasi 5 MB, nama file acak, ekstensi aman, dan signature JPG/PNG/WebP diperiksa sebelum disimpan.
- Input katalog dan pemesanan divalidasi ulang pada server; query PostgreSQL memakai parameter.
- Jangan commit `.env`, dump database, password, atau backup berisi data pelanggan.
- Untuk deployment multi-instance, pindahkan rate limit dari memori proses ke Redis atau gateway/reverse proxy.

Sebelum setiap rilis jalankan `npm ci`, `npm audit`, `npm test`, dan `npm run build`. Tidak ada aplikasi yang dapat dijamin bebas dari seluruh celah keamanan; tetap perbarui dependency, pantau log, batasi akses database, dan lakukan backup terenkripsi.

## SEO teknis

- Judul dan deskripsi berbahasa Indonesia, canonical URL, hreflang, Open Graph, Twitter Card, dan preview gambar absolut.
- Microdata `TravelAgency`, `OfferCatalog`, dan `FAQPage` berasal dari konten yang sama dengan halaman publik.
- `robots.txt` mengarahkan crawler ke sitemap serta mencegah crawl halaman admin, login, dan API.
- Halaman privat juga mengirim `X-Robots-Tag: noindex, nofollow` dan `Cache-Control: no-store`.
