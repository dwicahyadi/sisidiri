# Bank Pertanyaan Refleksi

Versi 1.1 — 11 Oktober 2026. Bahasa diperbarui untuk Gen Z dan milenial; ID, urutan, pole, dan makna pasangan dipertahankan. Materi orisinal yang disusun oleh asisten untuk proyek SisiDiri sesuai instruksi pengguna. Status: konten awal sudah masuk seed melalui database/questions.js; pemeriksaan keterbacaan bersama calon pengguna tetap diperlukan sebelum rilis. Ini bukan butir tes MBTI resmi, bukan salinan instrumen berlisensi, dan belum divalidasi psikometrik atau ditinjau psikolog.

## Petunjuk untuk Pengunjung

Pilih yang paling sering kamu lakukan, bukan yang terasa paling ideal. Kalau keduanya cocok, pilih yang paling menggambarkan kebiasaanmu belakangan ini. Tidak ada jawaban benar atau salah. Hasil membantu refleksi dan tidak menentukan kemampuan, nilai diri, atau diagnosis.

## Aturan Master dan Scoring

Tepat 20 pertanyaan aktif; masing-masing dimensi EI, SN, TF, JP memiliki lima pertanyaan. Satu pilihan memberi satu poin pada pole yang tercantum. Total skor setiap dimensi lima, sehingga tidak ada seri. Urutan huruf hasil selalu E/I, S/N, T/F, J/P.

`ID` pada tabel menjadi `questions.id`; `Urutan` menjadi `sort_order` dalam dimensi. Seluruh pertanyaan awal memakai `is_active = 1` dan `is_randomizable = 0` untuk menjaga urutan yang mudah diaudit. Label A/B hanya label tampilan; jangan menyimpulkan pole dari posisi opsi. `question_options.id` mengikuti tabel terakhir. Pole adalah metadata backend dan tidak dikirim dalam API kuis.

## EI — Ekstrovert / Introvert

Fokus refleksi: kecenderungan berinteraksi dan memulihkan energi, bukan kemampuan bersosialisasi.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 1 | 1 | Setelah hari yang melelahkan, kamu lebih sering ingin… | Ketemu orang yang aku suka. | E | Sendirian dulu di tempat yang tenang. | I |
| 2 | 2 | Saat mencari ide untuk masalah sehari-hari, kamu lebih nyaman… | Memikirkannya sendiri dulu. | I | Ngobrol dengan orang lain dulu. | E |
| 3 | 3 | Saat bertemu beberapa orang baru, kamu biasanya… | Mulai ngobrol untuk mengenal mereka. | E | Mengamati dulu sebelum ikut ngobrol. | I |
| 4 | 4 | Kalau punya waktu luang di akhir pekan, kamu lebih sering ingin… | Melakukan kegiatan sendiri. | I | Bikin kegiatan bareng teman atau keluarga. | E |
| 5 | 5 | Saat diskusi kelompok, kamu lebih sering… | Merangkai pikiran sambil bicara. | E | Merangkai pikiran dulu sebelum bicara. | I |

## SN — Sensing / Intuition

Fokus refleksi: informasi yang lebih dahulu diperhatikan, bukan kecerdasan atau kreativitas.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 6 | 1 | Saat belajar hal baru, kamu lebih tertarik mulai dari… | Gambaran besarnya dan kemungkinan penggunaannya. | N | Contoh nyata dan cara memakainya sekarang. | S |
| 7 | 2 | Saat cerita tentang pengalamanmu, kamu lebih sering membahas… | Kejadian dan detail yang aku ingat. | S | Makna atau pola yang aku tangkap. | N |
| 8 | 3 | Saat mengerjakan tugas yang sudah kamu kenal, kamu cenderung… | Mencoba cara lain yang mungkin cocok. | N | Memakai cara yang sudah terbukti membantu. | S |
| 9 | 4 | Saat membaca petunjuk, kamu lebih nyaman kalau dimulai dari… | Langkah yang bisa langsung aku ikuti. | S | Penjelasan umum tentang tujuan langkahnya. | N |
| 10 | 5 | Saat melihat rencana baru, hal pertama yang kamu perhatikan adalah… | Kemungkinan pengembangannya nanti. | N | Fakta dan kebutuhan yang ada sekarang. | S |

## TF — Thinking / Feeling

Fokus refleksi: pertimbangan yang didahulukan saat mengambil keputusan, bukan kemampuan berpikir atau memiliki empati.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 11 | 1 | Kalau dua pilihan sama-sama memungkinkan, kamu biasanya menimbang dulu… | Alasan masuk akal di balik tiap pilihan. | T | Dampak tiap pilihan bagi orang yang terlibat. | F |
| 12 | 2 | Saat memberi masukan ke teman, kamu biasanya memperhatikan dulu… | Bagaimana dia akan menerima masukanku. | F | Bagian masalah yang perlu diperbaiki. | T |
| 13 | 3 | Kalau dua orang beda pendapat soal keputusan bersama, kamu mencari dulu… | Patokan yang sama untuk menilai kedua pendapat. | T | Kebutuhan masing-masing di balik pendapatnya. | F |
| 14 | 4 | Kalau sebuah aturan kurang cocok untuk suatu situasi, kamu memikirkan dulu… | Keadaan khusus orang yang terkena aturan itu. | F | Alasan aturan itu perlu diterapkan secara konsisten. | T |
| 15 | 5 | Setelah mengambil keputusan sulit, kamu lebih sering menilainya dari… | Apakah alasannya tetap masuk akal. | T | Apakah keputusannya sesuai dengan nilai yang aku pegang. | F |

## JP — Judging / Perceiving

Fokus refleksi: kecenderungan mengatur kegiatan dan menyikapi pilihan, bukan kedisiplinan atau kualitas tanggung jawab.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 16 | 1 | Saat merencanakan hari libur, kamu lebih nyaman… | Memilih kegiatan sesuai suasana saat itu. | P | Menentukan kegiatan utama sebelum hari libur. | J |
| 17 | 2 | Saat mulai tugas yang tenggatnya masih jauh, kamu cenderung… | Menentukan tahapan kerja sejak awal. | J | Menyesuaikan tahapan sambil mengerjakannya. | P |
| 18 | 3 | Kalau beberapa pilihan sudah cukup baik, kamu lebih nyaman… | Tetap membuka pilihan kalau ada informasi baru. | P | Menetapkan pilihan supaya bisa lanjut. | J |
| 19 | 4 | Untuk kegiatan sehari-hari, kamu lebih suka… | Mengikuti daftar atau urutan yang sudah dibuat. | J | Memilih kegiatan berikutnya sesuai keadaan. | P |
| 20 | 5 | Kalau rencana mendadak berubah, hal pertama yang kamu lakukan adalah… | Melihat kemungkinan baru dari perubahan itu. | P | Menyusun ulang rencana supaya langkah berikutnya jelas. | J |

## ID Opsi untuk Seed

| Question ID | Option A ID | Option B ID |
|---|---|---|
| 1 | 1 | 2 |
| 2 | 3 | 4 |
| 3 | 5 | 6 |
| 4 | 7 | 8 |
| 5 | 9 | 10 |
| 6 | 11 | 12 |
| 7 | 13 | 14 |
| 8 | 15 | 16 |
| 9 | 17 | 18 |
| 10 | 19 | 20 |
| 11 | 21 | 22 |
| 12 | 23 | 24 |
| 13 | 25 | 26 |
| 14 | 27 | 28 |
| 15 | 29 | 30 |
| 16 | 31 | 32 |
| 17 | 33 | 34 |
| 18 | 35 | 36 |
| 19 | 37 | 38 |
| 20 | 39 | 40 |

Pilihan A memiliki `sort_order = 1`, B memiliki `sort_order = 2`. ID dimensi seed ditetapkan EI=1, SN=2, TF=3, JP=4. Posisi A berisi total 10 pole kiri dan 10 pole kanan lintas kuis; distribusi posisi ini bukan bukti validitas ilmiah. Jangan mengubah ID yang sudah dirujuk kontrak tanpa migrasi.

## Review Konten Sebelum Rilis

Periksa kejelasan bahasa bersama calon pengguna, kemungkinan situasi yang tidak relevan, dan pilihan yang terasa terlalu ideal. Pertanyaan EI 2/5 serta JP 17/19 memiliki tema berdekatan; pertahankan untuk draft pendek ini dan evaluasi apakah pengulangan mengganggu pengguna. T/F memakai penekanan pertimbangan pertama karena kedua aspek dapat dipakai bersamaan. Hasil tetap disebut kecenderungan reflektif; lima pertanyaan per dimensi tidak memberikan jaminan reliabilitas atau validitas.
