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

UI membatasi 25 pesan sukses; token HMAC berlaku absolut 60 menit. Server stateless memvalidasi token/ID/payload serta rate IP; jangan mengklaim kuota keras server atau anti-replay. Gunakan Interactions API, instruction setiap turn, dan konteks dari token/master. Jaga key/secret di environment.

Disclaimer akurasi cukup sekali di home dan penjelasan lengkap pada halaman tentang; hasil menautkan batasan. Jangan mengulang disclaimer pada kuis/tab/chat. Pertahankan privasi sebelum chat. Hasil hanya refleksi berdasarkan teori MBTI; penilaian profesional memerlukan ahli.

## Commit dan Pull Request

Gunakan subjek imperatif singkat, misalnya `quiz: validate answers`. PR menjelaskan perubahan, referensi kebutuhan, pemeriksaan nyata, screenshot bila tersedia, serta dampak kontrak/config/privasi. Perbarui dokumentasi yang terdampak bersama kode.
