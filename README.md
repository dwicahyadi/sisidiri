# SisiDiri

Aplikasi web refleksi berdasarkan teori MBTI: kuis 20 pertanyaan, hasil empat dimensi, dan ruang konsultasi Gemini. Implementasi MVP sudah tersedia. Hasil tidak dijamin akurat, belum divalidasi ahli, dan hanya membantu refleksi; penilaian profesional membutuhkan pemeriksaan ahli di bidangnya.

## Menjalankan Lokal

Gunakan Node.js 22.13+; runtime pengembangan dicatat di `.nvmrc` (22.22.1).

```bash
npm ci
npm run setup
npm run dev
```

Buka `http://127.0.0.1:3000`. `setup` membuat `.env` dengan secret acak tanpa mencetaknya dan tidak menimpa file yang sudah ada. `dev` membangun CSS, membuat database master jika belum tersedia, lalu menjalankan server dengan watch. Jika mengubah CSS, jalankan ulang build/dev. Jawaban dan hasil hilang saat halaman dimuat ulang.

## Mengaktifkan Konsultasi Gemini

Kuis dapat berjalan tanpa Gemini. SDK bersifat optional agar instalasi lokal tanpa AI tetap berguna. Lingkungan kerja awal tidak dapat mengunduh SDK karena akses registry dibatasi; lockfile awal belum memuat dependency tree SDK tersebut. Dari terminal dengan akses npm, jalankan:

```bash
npm install --save-optional --save-exact @google/genai@2.28.0
```

Isi `GEMINI_API_KEY` di `.env`; default model `gemini-2.5-flash` dapat diganti melalui `GEMINI_MODEL`. Restart server setelah mengubah konfigurasi. Jangan mengirim API key melalui chat atau commit. `CHAT_TOKEN_SECRET` harus base64 dari minimal 32 byte acak. Mode lokal tanpa secret memakai secret sementara; semua token sebelumnya invalid ketika server restart.

Produksi (`NODE_ENV=production`) mewajibkan key, model, secret tetap, dan SDK. Jalankan build serta seed sebelum start, gunakan HTTPS, dan atur `TRUST_PROXY` hanya ke IP/subnet proxy yang dipercaya. Runtime membuka database read-only. Node 22 masih memberikan peringatan eksperimental untuk node:sqlite; uji runtime deployment sebelum rilis.

## Command

| Command | Fungsi |
|---|---|
| `npm run setup` | Membuat .env lokal tanpa menimpa konfigurasi |
| `npm run dev` | Build, seed awal jika perlu, dan server watch |
| `npm run build` | CSS Tailwind/PostCSS dan beranda yang diprarender |
| `npm run db:seed` | Schema dan upsert master idempotent dengan ID stabil |
| `npm start` | Menjalankan server tanpa build/seed otomatis |
| `npm test` | Unit dan integrasi Express, dengan provider mock |
| `npm run check` | Pemeriksaan syntax JavaScript; bukan formatter/linter |

## Struktur

`src/features` berisi route/schema/scoring/instruction; `src/infrastructure` berisi repository SQLite dan adapter Gemini; `src/security` mengelola token; `public/js` berisi frontend ES modules; `styles` berisi CSS input; `database` berisi schema dan konten master; `tests` berisi unit/integrasi. Database lokal, .env, node_modules, dan CSS build diabaikan Git.

Dokumen produk, arsitektur, kontrak API, dan panduan desain berada di `docs/`. `README.md` dan `AGENTS.md` tetap di root. Template konfigurasi tersedia di [.env.example](.env.example); gunakan `npm run setup`, lalu isi konfigurasi pada `.env`.

Halaman: `/`, `/kuis`, `/hasil`, `/tentang`, dan `/privasi`. Catatan kecil akurasi tampil di beranda, kuis, dan hasil. Halaman tentang menjelaskan batasan dan perlunya penilaian ahli; privasi dijelaskan sebelum chat.

## Batas MVP dan Status Verifikasi

UI membatasi **25 pesan sukses**; server stateless memvalidasi token, payload, dan rate IP 30 request/10 menit. Token berlaku absolut 60 menit; tidak ada jaminan kuota keras server atau pencegahan replay. Gemini menyimpan state sesuai layanannya; menutup tab tidak otomatis menghapusnya. Aplikasi tidak menyimpan data pengguna ke SQLite, browser storage, analytics, atau log.

Build, seed, pemeriksaan syntax, serta test unit/integrasi dapat dijalankan. Test API memakai HTTP pipeline Express di dalam proses agar tidak membutuhkan port; Gemini dimock. Pemeriksaan browser dan Gemini live belum selesai: sandbox menolak port lokal dengan EPERM, browser menolak file URL, dan SDK/key belum tersedia. Jangan menyebut hasil ini sebagai rilis yang sudah diverifikasi di browser.

## Dokumen

- [PRD.md](docs/PRD.md): kebutuhan v1.2 dan disclaimer.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): komponen, aliran data, serta batas privasi.
- [API_CONTRACT.md](docs/API_CONTRACT.md): endpoint dan token.
- [DATA_MODEL.md](docs/DATA_MODEL.md): schema/master.
- [QUESTION_BANK.md](docs/QUESTION_BANK.md): 20 butir orisinal dengan ID, opsi, dan pole.
- [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md): status tahap dan pemeriksaan tersisa.
- [SELF_REVIEW.md](docs/SELF_REVIEW.md): hasil review dan keterbatasan.
- [AGENTS.md](AGENTS.md): panduan kontribusi.

## Pembaruan UI 11 Oktober 2026

Kuis langsung maju saat pilihan diklik, hasil memakai persentase dua warna dan tab ringkas, serta chat mengambang dengan mode layar penuh di ponsel. Browser desktop/360 px dan satu respons Gemini live sudah diperiksa melalui server lokal pengguna. Catatan pembatasan lingkungan di atas menggambarkan implementasi awal. Ilustrasi tipe dapat diganti di `public/assets/types/INFJ.png` dan kode uppercase lainnya, ukuran 600 × 600 px. Rincian: [docs/QUIZ_RESULT_DESIGN.md](docs/QUIZ_RESULT_DESIGN.md).

## Bahasa dan Tampilan SisiDiri

Nama aplikasi menggunakan SisiDiri dengan ikon mark.svg. Bahasa untuk Gen Z/milenial dan standar keterbacaan dicatat di [docs/COPY_GUIDE.md](docs/COPY_GUIDE.md). Setelah perubahan konten master, jalankan `npm run db:seed`; CSS dan home memerlukan `npm run build`. Restart server untuk perubahan instruction/error backend.
