# Arsitektur Personality Insight AI

Status: implementasi awal berdasarkan PRD v1.2, diizinkan pengguna 10 Oktober 2026. Struktur berikut sudah tersedia. Hasil review dan batas verifikasi ada di [SELF_REVIEW.md](SELF_REVIEW.md).

## Pilihan rancangan

Gunakan satu aplikasi Node.js LTS + Express yang menyajikan API dan frontend pada origin yang sama. Frontend berupa SPA ringan dengan JavaScript ES modules dan Tailwind CSS; pilihan ini mengambil opsi SPA yang diizinkan PRD. Hindari framework frontend tambahan sampai ada kebutuhan konkret. Runtime Node.js 22.13+ menggunakan SQLite bawaan (`node:sqlite`); Express 5.1.0, Zod 4.3.5, Tailwind 4.1.18, dan PostCSS dikunci di package-lock. Target SDK Google 2.28.0 belum terpasang karena registry tidak dapat diakses; SDK optional untuk kuis lokal dan wajib saat produksi. API key tidak diperlukan untuk alur kuis. Node 22 menandai node:sqlite sebagai eksperimental.

```text
src/
  app.js                  # Express, middleware, dan pemasangan route
  server.js               # Startup dan shutdown
  config/                 # Validasi environment
  features/
    quiz/                 # Route, schema, service scoring, repository master
    chat/                 # Route, schema, service konsultasi, instruction
  infrastructure/
    database/             # Koneksi SQLite dan repository bersama
    gemini/               # Adapter @google/genai
  middleware/             # Error handler, rate limit, security headers
  security/               # Penerbitan/verifikasi token chat HMAC
public/                   # HTML, browser ES modules, dan aset publik
styles/                   # Input Tailwind; output build menuju public/
database/                 # Migrasi dan seed master; file SQLite lokal diabaikan Git
tests/                    # Unit dan integrasi per fitur
```

Route menangani HTTP, schema memvalidasi input, service mengatur alur, repository membaca master, dan adapter menyembunyikan detail provider. Fungsi scoring dibuat murni agar dapat diperiksa tanpa HTTP atau Gemini.

## Aliran data

1. Browser mengambil master kuis melalui `GET /api/quiz`.
2. Pilihan pengguna hanya berada pada state JavaScript. Navigasi kembali mempertahankan pilihan; reload atau mulai ulang menghapus state.
3. `POST /api/quiz/score` memvalidasi 20 jawaban terhadap SQLite, menghitung empat skor, membaca deskripsi tipe, dan menerbitkan token bertanda tangan yang mengikat hasil. Server menjadi acuan hasil final.
4. Browser menampilkan hasil, lalu mengirim `message` dan `chatToken` saat chat pertama. Browser tidak mengirim ulang hasil atau ringkasan. Pada kelanjutan, tambahkan `previous_interaction_id` terakhir.
5. Backend memverifikasi token, expiry, serta kecocokan ID; mengambil skor dari token dan deskripsi dari master; kemudian memanggil `ai.interactions.create()`. Respons berisi `success`, `message`, `id`, dan token pengganti yang mengikat ID baru.
6. Browser memperbarui token/ID secara bersamaan di memori dan menambah penghitung setelah sukses. UI mengizinkan 25 pesan, menolak pesan ke-26, serta menjalankan satu request pada satu waktu. Reload/mulai ulang menghapus state; tidak ada pemulihan sesi aplikasi.

Token membuktikan hasil pernah divalidasi dan dihitung server; bukan identitas atau bukti pengisian oleh manusia. Signature mencegah modifikasi payload tanpa secret, tetapi tidak mencegah replay atau berbagi bearer credential.

## Token dan Batas Konsultasi

Token memakai HMAC-SHA256 dengan `CHAT_TOKEN_SECRET` backend terpisah. Payload mengikat tipe, empat skor, versi/purpose, waktu, dan interaction ID terakhir (null pada awal). Masa berlaku absolut 60 menit sejak scoring; token pengganti tidak memperpanjangnya. Verifikasi dilakukan sebelum provider dipanggil. Format serta aturan validasi ada di [API_CONTRACT.md](API_CONTRACT.md).

Backend tidak menyimpan sesi, hasil, atau rantai ID; setiap request memperoleh konteks dari token dan master. Token lama tidak otomatis tercabut saat token baru diterbitkan. Kuota 25 dijamin UI; backend menerapkan rate IP 30 request/10 menit serta validasi panjang/body/token. Enforcement keras per konsultasi memerlukan perubahan desain dan berada di luar MVP. Jangan menambah penyimpanan sesi untuk tujuan itu secara diam-diam.

## Integrasi Gemini

SDK dan API key hanya digunakan backend. Pakai Interactions API, `interaction.output_text`, `interaction.id`, dan `previous_interaction_id` sesuai PRD; jangan beralih ke `models.generateContent()` atau menambah tools.

Kirim `system_instruction` pada **setiap** interaksi, termasuk kelanjutan. Dokumentasi resmi menyatakan parameter tersebut berlaku per interaksi dan tidak diwariskan hanya dengan interaction ID; PRD v1.1 sudah menyelaraskannya. Model dikonfigurasi melalui `GEMINI_MODEL`, default `gemini-2.5-flash`. Adapter menargetkan SDK 2.28.0; timeout 30 detik, tanpa retry otomatis, serta output limit default 800 token. Kontrak adapter diperiksa dengan mock SDK; koneksi live belum diperiksa.

Target respons sekitar 180 kata/1.200 karakter melalui instruction dan output limit provider yang sesuai. Jangan memotong teks secara buta. Timeout tidak memicu retry otomatis karena provider mungkin sudah menghasilkan interaksi.

Sumber: [Google — Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview), diperiksa 10 Oktober 2026.

## Batas penyimpanan dan keamanan

SQLite hanya menyimpan empat tabel master. Jangan menulis jawaban, hasil, chat, token, atau interaction ID ke database, file log, analytics, maupun browser storage termasuk cookie. Hindari pencatatan request/response body kuis/chat. Hasil/token memakai `Cache-Control: no-store`. Rate limiter memakai penghitung IP sementara tanpa data konten; rancangan awal satu instance, pembatasan bersama pada beberapa instance memerlukan desain tersendiri.

Gemini menyimpan state percakapan untuk kelanjutan; aplikasi harus menjelaskannya sebelum chat. Halaman ditutup tidak otomatis menghapus data provider. Jangan menjanjikan penghapusan atau masa retensi tertentu tanpa pemeriksaan konfigurasi layanan.

Produksi mewajibkan `GEMINI_API_KEY`, `GEMINI_MODEL`, dan `CHAT_TOKEN_SECRET`, serta SDK yang terpasang. Mode development mengizinkan kuis tanpa key; secret kosong diganti secret acak sementara di memori yang berubah saat restart. PORT default 3000, HOST default 127.0.0.1, dan DATABASE_PATH default database/personality.sqlite. Implementasi menerapkan Zod, body 8 KiB, token maksimal 4 KiB, middleware security headers eksplisit, error publik aman, dan rate limit IP. Pesan maksimal 500 Unicode code points setelah trim. Render chat sebagai teks atau format yang disanitasi. Bahasa awal Indonesia dan visual profesional/tenang.

## Frontend dan Disclaimer

Beranda diprarender oleh build dari template yang juga dipakai browser; interaksi berikutnya memakai ES modules dan History API. Halaman tersedia pada `/`, `/kuis`, `/hasil`, `/tentang`, dan `/privasi`. Catatan akurasi kecil tampil di beranda/kuis/hasil, dengan penjelasan ahli dan batas instrumen pada `/tentang`. Teks chat dirender memakai textContent, tanpa HTML provider. CSS dibangun lokal; tidak ada CDN, font eksternal, atau analytics. Pemeriksaan browser pada lingkungan ini terhalang pembatasan port lokal dan akses file browser.
