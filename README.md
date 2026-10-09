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

Salin `.env.example` menjadi `.env`, lalu isi dengan akun PostgreSQL dan password admin yang unik:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wonderful_lombok
ADMIN_USERNAME=admin
ADMIN_INITIAL_PASSWORD=ganti-dengan-password-admin-yang-panjang-dan-unik
```

Jangan menggunakan password PostgreSQL sebagai password admin. File `.env` sudah dikecualikan dari Git.

Pastikan PostgreSQL berjalan dan user pada `DATABASE_URL` memiliki izin membuat database untuk inisialisasi pertama. Kemudian jalankan:

```bash
npm install
npm run db:init
npm run dev
```

Buka `http://127.0.0.1:5173`. Admin tersedia di `/admin`, dan pengguna yang belum login diarahkan ke `/login`.

Untuk mengakses development server dari perangkat lain pada jaringan lokal:

```bash
npm run dev -- --host 0.0.0.0
```

Buka `http://IP-KOMPUTER:5173` dari perangkat lain. Jangan mengekspos development server langsung ke internet.

Konfigurasi lokal disimpan di `.env` dan tidak masuk version control. Gunakan `.env.example` sebagai panduan untuk `DATABASE_URL`, `ADMIN_USERNAME`, dan `ADMIN_INITIAL_PASSWORD`. Menjalankan `db:init` kembali akan menyelaraskan password akun admin dengan nilai tersebut.

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
npm run build
NODE_ENV=production npm start
```

Pada Windows PowerShell, gunakan `$env:NODE_ENV='production'; npm start`. Tempatkan aplikasi di belakang reverse proxy HTTPS seperti Caddy atau Nginx. HTTPS diperlukan agar cookie admin memakai atribut `Secure`.

Environment production minimum:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_INITIAL_PASSWORD`
- `NODE_ENV=production`

Jalankan aplikasi menggunakan process manager atau service manager, bukan terminal interaktif. Batasi akses PostgreSQL hanya dari server aplikasi dan lakukan backup berkala.

## Implementasi

- Katalog dan informasi website disimpan sebagai JSONB di PostgreSQL.
- Password admin disimpan sebagai hash scrypt dengan salt terpisah.
- Session admin memakai token acak yang disimpan dalam bentuk hash dan cookie `HttpOnly`.
- Halaman publik membaca data terbaru langsung dari PostgreSQL.
- Admin dapat mengatur Paket Wisata, tarif Paket Travel, Rental, kontak, teks utama, dan media sosial.
- Jarak Paket Travel mengikuti rute berkendara OSRM pada peta Leaflet dan OpenStreetMap.

## Batas lokal

- Upload gambar belum tersedia; admin memasukkan URL gambar.
- Routing membutuhkan koneksi internet ke layanan publik OSRM dan OpenStreetMap.
- Untuk deployment HTTPS, jalankan hasil adapter Node dengan `NODE_ENV=production` agar cookie session memakai atribut `Secure`.

## Keamanan

- Password admin di-hash dengan scrypt dan salt unik.
- Token session acak hanya disimpan sebagai hash di database.
- Cookie session memakai `HttpOnly`, `SameSite=Strict`, dan `Secure` pada production.
- Login dan guest booking memiliki rate limit dasar.
- Endpoint admin memerlukan session aktif dan request mutasi dilindungi pemeriksaan origin SvelteKit.
- Header keamanan dasar diterapkan dari server.
- Jangan commit `.env`, dump database, password, atau backup berisi data pelanggan.
- Untuk deployment multi-instance, pindahkan rate limit dari memori proses ke Redis atau gateway/reverse proxy.
