# Rencana dan Status Implementasi

Acuan: PRD v1.2. Pengguna telah meminta implementasi pada 10 Oktober 2026. Larangan mulai kode pada tahap sebelumnya sudah dicabut oleh instruksi tersebut.

## 1. Fondasi — Tersedia

Node.js 22.13+, Express, Zod, frontend vanilla ES modules, Tailwind/PostCSS, serta SQLite bawaan Node. Scripts nyata tercantum di README. SDK Google 2.28.0 optional untuk kuis lokal, tetapi wajib bagi produksi dan chat live. Paket inti terpasang dari cache lokal; unduhan SDK tidak tersedia karena pembatasan jaringan.

## 2. Master, Scoring, dan Token — Tersedia

Schema empat tabel dan seed idempotent berisi 4 dimensi, 20 pertanyaan, 40 opsi, serta 16 deskripsi tipe. Runtime read-only memvalidasi master saat startup. Fungsi scoring dan endpoint quiz/score menerbitkan token HMAC dengan expiry absolut 60 menit. Test mencakup seluruh 16 tipe, payload invalid, token rusak/expired, ID chaining, serta database yang tidak berubah setelah request.

## 3. UI — Kode Tersedia, Browser Belum Diverifikasi

Beranda diprarender; alur kuis menampilkan satu pertanyaan, progress, kembali/lanjut, hasil, empat skor, dan mulai ulang. State hanya di memori. Catatan akurasi tampil di beranda/kuis/hasil dengan halaman `/tentang`; halaman `/privasi` menjelaskan Gemini. Visual profesional/tenang dan CSS responsive sudah disusun.

Pemeriksaan tersisa: alur penuh di browser desktop/360 px, navigasi keyboard, fokus, keterbacaan/kontras, serta pengukuran target tampil <2 detik. Sandbox menolak pembukaan port lokal dan browser tidak mengizinkan file URL; belum ada bukti screenshot atau alur browser nyata.

## 4. AI — Adapter dan UI Tersedia, Live Belum Diverifikasi

Adapter memakai Interactions API, instruction setiap pesan, context master, token/ID chaining, timeout tanpa retry, dan output limit. UI membatasi 25 pesan sukses dan satu request berjalan. Server memvalidasi pesan 500 code points, body 8 KiB, token 4 KiB, serta rate IP 30 request/10 menit; quiz/score dibatasi 120 request/10 menit. Mock SDK memeriksa kontrak, respons kosong/tidak lengkap, dan timeout. HTTP pipeline memeriksa penolakan sebelum provider dipanggil.

Pemeriksaan tersisa: instal SDK dari npm dengan jaringan tersedia, isi key lokal, jalankan dua pesan live dan periksa output/model. Verifikasi batas 25 dalam browser nyata dan UI error tanpa kehilangan draft. Jangan memakai respons mock sebagai klaim Gemini live.

## 5. Sebelum Rilis

Lakukan seluruh pemeriksaan browser/live di atas, review bank pertanyaan dan deskripsi dengan calon pengguna, serta uji build produksi/HTTPS/trusted proxy pada hosting yang dipilih. Periksa storage browser, cache, log server/hosting, dan SQLite. Lengkapi dependency lock SDK setelah diinstal. Jangan menyatakan materi telah divalidasi psikometrik atau ditinjau ahli tanpa bukti.

Kuota keras server, pencabutan token individual, dan pencegahan replay tetap di luar MVP. Tidak ada deployment atau publikasi pada pekerjaan ini.
