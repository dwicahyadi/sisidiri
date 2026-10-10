# Model Data Master

Status: implementasi SQLite selaras PRD v1.2. Schema ada di database/schema.sql; seed idempotent di database/seed.js; file SQLite lokal diabaikan Git. Runtime memakai node:sqlite dalam mode read-only; aplikasi hanya membaca master.

## Tabel dan invarian

| Tabel | Kunci dan aturan |
|---|---|
| `dimensions` | `id` primary key; `code` unik pada EI, SN, TF, JP; label kiri/kanan dan urutan konsisten |
| `questions` | `id` primary key; `dimension_id` foreign key; teks wajib; flag aktif dan pengacakan boolean |
| `question_options` | `id` primary key; `question_id` foreign key; teks wajib; pole sesuai dimensi; unik `(question_id, pole)` |
| `personality_types` | `code` primary key; satu dari 16 kombinasi E/I × S/N × T/F × J/P; deskripsi dan flag aktif |

Gunakan tipe INTEGER untuk ID, urutan, dan boolean 0/1; TEXT untuk kode, label, dan deskripsi. `strengths`, `challenges`, dan `reflection_tips` berupa array string yang diserialisasi sebagai JSON TEXT, divalidasi saat seed dan diubah menjadi array oleh repository. `communication_style` berupa teks. Kontrak memakai nama camelCase saat dikirim melalui API.

Aktifkan foreign key pada setiap koneksi SQLite. Constraint baris menangani keunikan, nilai boolean, dan referensi; validasi seed/service menangani aturan lintas baris seperti jumlah opsi dan kecocokan pole.

## Validasi seed dan master

- Empat dimensi aktif, masing-masing tepat lima pertanyaan aktif; total tepat 20. Bank boleh memiliki lebih banyak pertanyaan **nonaktif**.
- Setiap pertanyaan aktif memiliki tepat dua opsi, masing-masing satu untuk kutub kiri dan kanan dimensinya.
- Seluruh 16 tipe tersedia dan aktif, dengan judul serta deskripsi yang diperlukan halaman hasil.
- Tidak ada orphan, ID duplikat, pole asing, atau konten kosong.
- Pertahankan ID stabil sesuai [QUESTION_BANK.md](QUESTION_BANK.md): dimensi EI=1, SN=2, TF=3, JP=4; pertanyaan 1–20 dan opsi 1–40. Gunakan seed idempotent dengan upsert berkunci stabil dan transaksi; jangan menghapus lalu membuat ulang ID yang dirujuk API.
- Seluruh pertanyaan awal aktif dan tidak diacak (`is_randomizable = 0`); pole mengikuti tabel bank, bukan posisi A/B.

Tolak master tidak konsisten saat startup/readiness sebelum melayani kuis. Jangan menambal konfigurasi invalid dengan memilih 20 pertanyaan sembarang. Pengacakan hanya mengubah urutan; tidak mengubah keanggotaan kuis.

## Batas akses dan konten

Kode runtime membaca master; perubahan master dilakukan melalui migrasi/seed terkontrol. Tidak dibuat tabel `users`, `quiz_attempts`, `answers`, `chat_histories`, atau `sessions`. Jangan menambah tabel telemetry berisi data pengguna.

Konten awal pertanyaan adalah 20 butir orisinal Bahasa Indonesia di QUESTION_BANK.md, disusun asisten atas instruksi pengguna; bukan salinan tes resmi/bank berlisensi dan belum divalidasi psikometrik atau ditinjau psikolog. Lakukan review keterbacaan sebelum rilis. Deskripsi reflektif orisinal 16 tipe sudah disusun di database/personality-types.js, dengan judul, ringkasan, kekuatan, tantangan, komunikasi, dan tips. Konten pertanyaan di database/questions.js mengikuti ID/opsi/pole dalam QUESTION_BANK.md. Fixture test harus ditandai contoh.

Token, signature, expiry, serta interaction ID tidak memerlukan tabel baru. Hasil yang ada di token diterbitkan dari scoring server dan hanya diproses sementara setiap request; tidak disimpan ke SQLite. Rate counter sementara juga bukan data master.
