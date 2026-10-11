# Deploy SisiDiri ke Vercel

## Konfigurasi proyek

Import repository GitHub, pilih framework **Express**, Node.js **22.x**, dan root repository. `vercel.json` mengatur build `npm run build:vercel`; jangan mengisi output directory atau menggunakan `npm start` sebagai build command.

Build membuat database master SQLite dan halaman HTML SEO. Database disertakan dalam function dan dibuka read-only. Runtime tidak melakukan seed atau menyimpan data pengguna. Aset dan HTML dilayani CDN Vercel; API memakai default export `app.js`, tanpa listener port.

## Environment variables

Atur melalui Settings > Environment Variables, lalu redeploy. Isi secret, key/model, dan SITE_URL pada scope Production; untuk Preview gunakan secret terpisah dan key/model sendiri, atau CHAT_ENABLED=false jika AI tidak diperlukan. Build Vercel memvalidasi konfigurasi sebelum membuat output:

| Variabel | Pengaturan |
|---|---|
| `NODE_ENV` | `production` (disediakan build/runtime produksi) |
| `SITE_URL` | Origin utama, misalnya `https://nama-proyek.vercel.app`; ganti ketika memakai domain sendiri |
| `CHAT_TOKEN_SECRET` | Base64 minimal 32 byte acak; jangan berubah di antara instance |
| `GEMINI_API_KEY` | API key milik sendiri, hanya backend |
| `GEMINI_MODEL` | Model yang tersedia pada akun |
| `VERCEL_ANALYTICS_ENABLED` | `true` untuk mengaktifkan integrasi produksi |
| `GOOGLE_SITE_VERIFICATION` | Opsional: nilai content dari tag verifikasi Search Console |
| `UPSTASH_REDIS_REST_URL` | Origin HTTPS database Upstash Redis; wajib termasuk Preview |
| `UPSTASH_REDIS_REST_TOKEN` | REST token rahasia database yang sama pada semua instance dalam environment |
| `CHAT_DAILY_LIMIT` | Default 200 percobaan AI per hari UTC; sesuaikan anggaran |
| `CHAT_ENABLED` | `true`; ubah ke `false` dan redeploy untuk mematikan AI sementara |

Buat secret sekali dari terminal:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Jangan isi `PORT`, `HOST`, `DATABASE_PATH`, atau `TRUST_PROXY` untuk deployment Vercel standar. Jika `SITE_URL` kosong, aplikasi memakai `VERCEL_PROJECT_PRODUCTION_URL`; aktifkan system environment variables Vercel. Origin tidak pernah ditentukan dari header Host pengunjung. Preview memakai canonical situs utama tetapi `noindex`, robots melarang crawl, dan analytics nonaktif. Gunakan Deployment Protection untuk preview bila tersedia.

## SEO dan analytics

Home, Tentang, dan Privasi memiliki HTML, title, description, canonical, Open Graph, Twitter Card, dan gambar share 1200 x 630. Kuis dan hasil memakai `noindex`; sitemap hanya memuat tiga halaman publik. Metadata berubah saat navigasi SPA tanpa menyisipkan hasil pribadi.

Buka tab **Analytics**, klik **Enable**, lalu deploy ulang. Integrasi HTML resmi memuat `/_vercel/insights/script.js`; halaman tetap berfungsi jika script diblokir. Hanya page view pada lima route aplikasi yang diterima. Query/hash dibuang; tidak ada custom event, jawaban, tipe MBTI, chat, token, atau interaction ID. Statistik mencakup kunjungan, route, sumber, dan perangkat. Halaman Privasi menjelaskan analytics.

Paket Hobby saat diperiksa menyediakan 50.000 event/bulan, dengan laporan satu bulan dan tanpa custom event. Kuota dibagi dengan proyek lain dalam tim; periksa dashboard karena kebijakan dapat berubah. Hobby ditujukan untuk penggunaan personal/nonkomersial; tidak adanya monetisasi bukan satu-satunya penentu kesesuaian paket.

## Mengganti ilustrasi

Ganti source PNG di `public/assets/`, jalankan `npm run assets:optimize` (Python 3 + Pillow dan font DejaVu), lalu `npm run build`. Commit WebP/JPG yang dihasilkan bersama PNG. Vercel memakai hasil optimasi yang sudah di-commit, sehingga build tidak membutuhkan Python atau layanan gambar berbayar.

## Batas biaya dan keamanan

Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia. Redis hanya menyimpan ID sesi acak, nomor giliran/status request sampai expiry absolut 60 menit, HMAC alamat IP untuk penghitung 10 menit, dan agregat harian sampai pergantian hari UTC + 60 detik. Jawaban, hasil, chat, token, dan interaction ID tidak disimpan di Redis, SQLite, analytics, atau log aplikasi. Memori lokal hanya untuk development.

Sebelum membagikan URL secara luas, tetapkan quota request/model di akun AI dan periksa pemakaian; Vercel gratis tidak menjamin layanan AI gratis. Aktifkan perlindungan/rate limiting edge yang tersedia pada paket, tanpa mengasumsikan fitur berbayar. `CHAT_ENABLED=false` merupakan pemutus chat manual setelah redeploy, bukan pembatas biaya otomatis. Batasi request body/token dan jangan log request/response kuis/chat pada hosting.

## Pemeriksaan setelah deploy

1. Buka `/`, `/tentang`, dan `/privasi` langsung; cek View Source untuk metadata dan konten yang berbeda.
2. Periksa `/robots.txt`, `/sitemap.xml`, dan preview share; pastikan canonical memakai domain utama.
3. Selesaikan kuis, ubah jawaban dengan Kembali, periksa hasil, tab, dan chat pada desktop/ponsel.
4. Pastikan `/api/health` menunjukkan kesiapan chat dan satu percakapan AI berhasil. Cek expired token dan kegagalan provider tanpa membagikan token.
5. Pastikan page view masuk dashboard Analytics setelah berpindah halaman; isinya tidak mencantumkan jawaban atau chat.
6. Tambahkan domain ke Google Search Console dan submit `/sitemap.xml`. Pemeriksaan performa nyata dilakukan pada URL produksi.

## Referensi resmi

Diperiksa 11 Oktober 2026: [Express di Vercel](https://vercel.com/docs/frameworks/backend/express), [Web Analytics](https://vercel.com/docs/analytics/quickstart), [biaya Analytics](https://vercel.com/docs/analytics/limits-and-pricing), [Hobby](https://vercel.com/docs/plans/hobby), [header request](https://vercel.com/docs/headers/request-headers), dan [JavaScript SEO Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Redis dan penanganan gangguan

Buat database Upstash Redis, salin REST URL/token ke environment Vercel, lalu redeploy. Gunakan database/secret terpisah untuk Preview. Jangan mengganti secret atau menghapus key saat traffic berjalan: namespace dan hitungan akan berubah. Pertahankan konfigurasi yang sama pada deployment produksi yang aktif. Penghapusan/eviction state sesi menutup akses, bukan menerbitkan ulang kuota.

Operasi register, rate, claim, dan finish memakai Lua EVAL atomik melalui HTTPS. Jika Redis gagal, API menolak dengan 503 sebelum memanggil AI. Request yang terputus setelah claim dapat tetap pending sampai expiry; pengguna perlu mengulang kuis. Kegagalan provider yang terkonfirmasi melepas pending untuk retry manual, tetap dihitung pada batas harian. Batas harian membatasi jumlah percobaan, bukan nilai biaya pasti; tetap tetapkan kuota pada akun provider. Kuis scoring juga memerlukan Redis untuk menerbitkan akses chat. Halaman statis tetap tersedia saat Redis bermasalah.

Lihat [Upstash REST API](https://upstash.com/docs/redis/features/restapi) untuk memperoleh URL/token dan [EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval) untuk operasi atomik. Verifikasi koneksi nyata dan pemakaian pada dashboard setelah deploy; pengujian lokal menggunakan mock.
