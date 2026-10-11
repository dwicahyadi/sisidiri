# Security Review SisiDiri

Tanggal: 11 Oktober 2026. Cakupan: source API/frontend, token, SQLite, konfigurasi deployment, analytics, dan pemeriksaan lokal dengan provider mock. Review awal tidak melakukan deploy, pengiriman pesan ke AI live, atau pentest pada domain publik.

## Temuan

### S1 - Tinggi: batas penggunaan AI dapat dilewati

Lokasi: `src/security/chat-token.js:43`, `src/features/chat/routes.js:13`, dan `src/features/quiz/routes.js:13`.

Token ditandatangani dan kedaluwarsa setelah 60 menit, tetapi tidak memiliki counter pesan atau pencabutan token lama. Pengikatan interaction ID tidak menolak replay token awal. Endpoint scoring menerima jawaban valid dari program tanpa bukti bahwa pengunjung menyelesaikan UI. Token membuktikan hasil valid, bukan manusia atau hak atas kuota.

Bukti: 26 POST chat dengan token awal yang sama menghasilkan 26 HTTP 200 dan 26 panggilan provider mock; tidak ada request AI sungguhan. Ini melewati kuota UI 25, masih berada di bawah rate 30 request/10 menit. Percabangan/parallel request juga tidak diserialisasi server.

Dampak: penyalahgunaan kuota/biaya AI dan penurunan ketersediaan. Ini batas desain MVP yang sudah diterima, bukan bypass signature atau kebocoran key.

Tindakan: sebelum distribusi luas, tetapkan quota provider dan pembatasan di edge. Untuk kuota sesi keras/anti-replay, diperlukan counter atomik/shared state atau rancangan lain yang disepakati. Signed counter saja tidak mencegah replay. Jangan menambahkan penyimpanan sesi/data pengguna tanpa keputusan eksplisit. CHAT_ENABLED=false mematikan AI setelah redeploy sebagai pemutus manual.

### S2 - Sedang: rate limit tidak global pada serverless

Lokasi: `src/middleware/security.js:24` dan `src/app.js:17`.

Penghitung berada di Map proses. Instance baru, scaling, restart, atau deployment mempunyai penghitung sendiri. Angka 30 request/10 menit bukan jaminan global per IP di Vercel; penyerang juga bisa memakai beberapa IP.

Tindakan: gunakan pembatasan edge Vercel yang tersedia pada paket atau shared limiter dengan kebijakan privasi yang sesuai. Tetap gunakan quota provider sebagai lapisan pembatas dampak. Membatasi concurrency lokal saja tidak menyelesaikan scaling antar-instance.

## Kontrol yang sudah tersedia

- HMAC-SHA256, timingSafeEqual, validasi payload/hasil, expiry absolut, serta secret tetap wajib pada produksi/Vercel.
- Zod strict, 20 jawaban unik dengan opsi yang sesuai, pesan maksimal 500 code points, body JSON 8 KiB, token maksimal 4 KiB.
- Query database memakai parameter; runtime read-only. Database dan .env tidak terdaftar sebagai file Git yang diperiksa dan tidak berada di public.
- Balasan AI dirender sebagai teks; nilai dinamis HTML di-escape. CSP melarang inline script/eval, frame protection dan nosniff tersedia.
- API no-store; error tidak mengirim stack atau pesan mentah provider. Tidak ditemukan pencatatan body kuis/chat pada kode yang diperiksa.
- Analytics hanya page view route yang diizinkan, menghapus query/hash, menolak custom event; tanpa konten kuis/chat atau token.
- Provider memakai store=true; penyimpanan percakapan dan tidak adanya penghapusan otomatis dijelaskan di UI.

## Dependency dan batas verifikasi

Lockfile saat review: Express 5.1.0, body-parser 2.3.0, qs 6.16.0, path-to-regexp 8.4.2, SDK 2.28.0. body-parser 2.3.0 mencakup perbaikan advisory GHSA-v422-hmwv-36x6; konfigurasi parser juga memakai limit tetap valid 8kb. Pemeriksaan ini bukan daftar advisory lengkap.

npm audit --omit=dev --json gagal karena EAI_AGAIN ke registry.npmjs.org. Belum dapat menyatakan dependency bebas advisory. Jalankan audit pada terminal/CI berjaringan; dependency build juga perlu diperiksa melalui npm audit tanpa omit. Tujuh berkas test lokal lulus, tetapi tidak membuktikan keamanan deployment.

Belum diperiksa: respons HTTPS/header/domain publik, konfigurasi firewall/quota/retensi akun provider, logging hosting, secret di riwayat Git penuh, dan pengujian penetrasi. Tidak ada temuan kritis yang terkonfirmasi dalam cakupan ini; itu bukan jaminan tidak ada celah.

## Referensi

- [Body-parser advisory dan patched version](https://github.com/advisories/GHSA-v422-hmwv-36x6).
- [Rate limiting edge Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).
- [Keputusan/batas deployment](DEPLOYMENT.md).

Kesimpulan awal digantikan oleh status perbaikan di bawah; konfigurasi eksternal tetap perlu diperiksa.

## Status perbaikan setelah persetujuan pengguna

S1/S2 diperbaiki pada kode: Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia.

Redis hanya menyimpan ID sesi acak, nomor giliran/status request sampai expiry absolut 60 menit, HMAC alamat IP untuk penghitung 10 menit, dan agregat harian sampai pergantian hari UTC + 60 detik. Jawaban, hasil, chat, token, dan interaction ID tidak disimpan di Redis, SQLite, analytics, atau log aplikasi. Memori lokal hanya untuk development.

Delapan berkas test lokal lulus, termasuk 25 balasan berantai sukses lalu pesan ke-26 ditolak, 25 replay ditolak tanpa tambahan panggilan provider, pending bersamaan, retry gagal, kuota harian lintas sesi, serta kegagalan REST Redis. Provider dimock; tidak ada AI live. Lua ditinjau, tetapi Redis/Upstash nyata dan deployment Vercel belum diuji. Audit dependency tetap terhalang jaringan. Semua batasan verifikasi eksternal di atas tetap berlaku.
