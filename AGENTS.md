# Repository Guidelines

## Acuan dan Status

Implementasi MVP telah diizinkan pengguna pada 10 Oktober 2026. Baca [PRD.md](docs/PRD.md) v1.2, [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API_CONTRACT.md](docs/API_CONTRACT.md), dan [SELF_REVIEW.md](docs/SELF_REVIEW.md). Browser desktop/360 px dan satu pesan Gemini live sudah diperiksa. Lihat docs/QUIZ_RESULT_DESIGN.md untuk cakupan dan batas verifikasi; jangan menyebutnya siap rilis tanpa pemeriksaan yang diperlukan.

## Struktur Proyek

`src/features/quiz` menangani schema/scoring/route; `src/features/chat` menangani schema/instruction/route. `src/infrastructure` memuat repository SQLite dan adapter Gemini, `src/security` mengelola token, `public/js` berisi frontend ES modules, `styles` berisi input Tailwind, `database` memuat schema/konten/seed, dan `tests` memuat unit/integrasi. Gunakan Node.js 22.13+ sesuai package.json; versi lokal ada di .nvmrc.

## Command Pengembangan

Jalankan `npm ci`, `npm run setup`, lalu `npm run dev`. Setup tidak menimpa .env; dev membangun CSS dan membuat master jika belum tersedia. `npm run build` memperbarui CSS serta beranda yang diprarender. `npm run db:seed` melakukan upsert master; `npm start` hanya menjalankan server. SDK Google optional untuk kuis lokal, tetapi wajib saat produksi; lihat README untuk instalasi dan konfigurasi Gemini.

## Gaya dan Pemeriksaan

Gunakan ES modules, indentasi dua spasi, semicolon, single quotes, serta identifier Inggris dengan camelCase/PascalCase. Data seed terserialisasi boleh memakai format JSON. Dokumentasi/UI Bahasa Indonesia; visual profesional/tenang. Brand SisiDiri memakai mark.svg. Ikuti docs/COPY_GUIDE.md: bahasa konkret untuk Gen Z/milenial, tanpa slogan/jargon, dengan font yang tetap dan teks isi 16–18 px.

Jalankan `npm run check` untuk syntax dan `npm test` untuk pemeriksaan bermakna sesuai perubahan. Runner memakai node:test; nama berkas `*.test.js`. API diuji melalui pipeline Express dalam proses, provider dimock, dan database sementara dibersihkan. Belum ada formatter/linter atau target coverage. Periksa browser desktop/360 px dan keyboard ketika lingkungan mendukung.

## Batas Produk dan Privasi

Pertahankan 20 pertanyaan, ID/pole pada docs/QUESTION_BANK.md, serta empat tabel master. Runtime database read-only. Jawaban, hasil, chat, token, dan interaction ID tidak boleh disimpan aplikasi atau log; state browser hanya di memori.

Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia.

Disclaimer akurasi cukup sekali di home dan penjelasan lengkap pada halaman tentang; hasil menautkan batasan. Jangan mengulang disclaimer pada kuis/tab/chat. Pertahankan privasi sebelum chat. Hasil hanya refleksi berdasarkan teori MBTI; penilaian profesional memerlukan ahli.

## Commit dan Pull Request

Gunakan subjek imperatif singkat, misalnya `quiz: validate answers`. PR menjelaskan perubahan, referensi kebutuhan, pemeriksaan nyata, screenshot bila tersedia, serta dampak kontrak/config/privasi. Perbarui dokumentasi yang terdampak bersama kode.

## Deployment dan SEO

Target Vercel Hobby: baca docs/DEPLOYMENT.md. Build membuat master read-only dan HTML SEO per route; app.js mengekspor Express tanpa listener. Jangan seed saat request. Analytics hanya page view produksi, tanpa query/hash atau konten kuis/chat; preview noindex dan tanpa analytics. Source ilustrasi PNG dipertahankan; frontend memakai WebP. Redis bersama wajib untuk limiter dan counter sesi produksi.
