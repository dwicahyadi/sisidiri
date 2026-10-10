# Bank Pertanyaan Refleksi

Versi 1.0 — 10 Oktober 2026. Materi orisinal yang disusun oleh asisten untuk proyek Personality Insight AI sesuai instruksi pengguna. Status: konten awal sudah masuk seed melalui database/questions.js; pemeriksaan keterbacaan bersama calon pengguna tetap diperlukan sebelum rilis. Ini bukan butir tes MBTI resmi, bukan salinan instrumen berlisensi, dan belum divalidasi psikometrik atau ditinjau psikolog.

## Petunjuk untuk Pengunjung

Pilih pilihan yang lebih sering menggambarkan kebiasaan Anda dalam keseharian, bukan yang terasa paling ideal. Jika keduanya cocok, pilih yang paling mendekati kecenderungan Anda belakangan ini. Tidak ada jawaban benar atau salah. Hasil membantu refleksi dan tidak menentukan kemampuan, nilai diri, atau diagnosis.

## Aturan Master dan Scoring

Tepat 20 pertanyaan aktif; masing-masing dimensi EI, SN, TF, JP memiliki lima pertanyaan. Satu pilihan memberi satu poin pada pole yang tercantum. Total skor setiap dimensi lima, sehingga tidak ada seri. Urutan huruf hasil selalu E/I, S/N, T/F, J/P.

`ID` pada tabel menjadi `questions.id`; `Urutan` menjadi `sort_order` dalam dimensi. Seluruh pertanyaan awal memakai `is_active = 1` dan `is_randomizable = 0` untuk menjaga urutan yang mudah diaudit. Label A/B hanya label tampilan; jangan menyimpulkan pole dari posisi opsi. `question_options.id` mengikuti tabel terakhir. Pole adalah metadata backend dan tidak dikirim dalam API kuis.

## EI — Ekstrovert / Introvert

Fokus refleksi: kecenderungan berinteraksi dan memulihkan energi, bukan kemampuan bersosialisasi.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 1 | 1 | Setelah hari yang melelahkan, cara beristirahat yang lebih sering Anda pilih adalah… | Menghabiskan waktu bersama orang yang saya sukai. | E | Menikmati waktu sendiri dalam suasana tenang. | I |
| 2 | 2 | Saat mencari ide untuk persoalan sehari-hari, Anda lebih nyaman… | Memikirkannya sendiri terlebih dahulu. | I | Membicarakannya dengan orang lain terlebih dahulu. | E |
| 3 | 3 | Ketika berada dalam pertemuan dengan beberapa orang baru, Anda cenderung… | Memulai percakapan untuk mengenal mereka. | E | Mengamati dahulu sebelum ikut percakapan. | I |
| 4 | 4 | Saat ada waktu luang pada akhir pekan, Anda lebih sering ingin… | Memiliki waktu pribadi untuk kegiatan sendiri. | I | Mengatur kegiatan bersama teman atau keluarga. | E |
| 5 | 5 | Dalam diskusi kelompok, Anda lebih sering… | Menyusun pikiran sambil menyampaikannya. | E | Menyusun pikiran sebelum menyampaikannya. | I |

## SN — Sensing / Intuition

Fokus refleksi: informasi yang lebih dahulu diperhatikan, bukan kecerdasan atau kreativitas.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 6 | 1 | Saat mempelajari sesuatu yang baru, Anda lebih tertarik memulai dari… | Gambaran besar dan kemungkinan penggunaannya. | N | Contoh konkret dan cara menggunakannya saat ini. | S |
| 7 | 2 | Saat menjelaskan pengalaman kepada orang lain, Anda lebih sering menekankan… | Kejadian nyata dan detail yang saya ingat. | S | Makna atau pola yang saya tangkap dari pengalaman itu. | N |
| 8 | 3 | Saat mencoba cara untuk menyelesaikan tugas yang sudah dikenal, Anda cenderung… | Menjelajahi kemungkinan pendekatan yang berbeda. | N | Memulai dari pendekatan yang sudah terbukti berguna. | S |
| 9 | 4 | Saat membaca petunjuk, Anda lebih nyaman jika penjelasan dimulai dengan… | Langkah konkret yang dapat langsung diikuti. | S | Konsep umum yang menjelaskan tujuan langkahnya. | N |
| 10 | 5 | Saat melihat sebuah rencana baru, perhatian Anda lebih dahulu tertuju pada… | Kemungkinan pengembangannya di masa depan. | N | Fakta dan kebutuhan praktisnya saat ini. | S |

## TF — Thinking / Feeling

Fokus refleksi: pertimbangan yang didahulukan saat mengambil keputusan, bukan kemampuan berpikir atau memiliki empati.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 11 | 1 | Saat dua pilihan sama-sama memungkinkan, Anda biasanya lebih dahulu menimbang… | Alasan logis yang mendukung setiap pilihan. | T | Dampak setiap pilihan bagi orang yang terlibat. | F |
| 12 | 2 | Saat memberi masukan kepada teman, Anda biasanya lebih dahulu memperhatikan… | Bagaimana masukan itu akan diterima olehnya. | F | Bagian persoalan yang perlu diperbaiki. | T |
| 13 | 3 | Jika dua orang berselisih tentang keputusan bersama, Anda lebih dahulu mencari… | Kriteria yang konsisten untuk menilai kedua pendapat. | T | Kebutuhan pribadi yang melatarbelakangi kedua pendapat. | F |
| 14 | 4 | Saat aturan umum kurang cocok untuk satu situasi, Anda lebih dahulu mempertimbangkan… | Keadaan khusus orang yang terkena aturan itu. | F | Alasan aturan itu diterapkan secara konsisten. | T |
| 15 | 5 | Setelah membuat keputusan yang sulit, Anda lebih sering menilai keputusan itu dari… | Apakah alasan yang dipakai tetap masuk akal. | T | Apakah keputusan itu selaras dengan nilai yang saya pegang. | F |

## JP — Judging / Perceiving

Fokus refleksi: kecenderungan mengatur kegiatan dan menyikapi pilihan, bukan kedisiplinan atau kualitas tanggung jawab.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 16 | 1 | Saat merencanakan hari libur, Anda lebih nyaman… | Menentukan kegiatan mengikuti suasana saat itu. | P | Menentukan kegiatan utama sebelum hari libur tiba. | J |
| 17 | 2 | Saat memulai tugas dengan tenggat yang cukup jauh, Anda cenderung… | Menentukan tahapan pengerjaan sejak awal. | J | Menyesuaikan tahapan sambil mengerjakannya. | P |
| 18 | 3 | Ketika beberapa pilihan sudah cukup baik, Anda lebih nyaman… | Menjaga pilihan tetap terbuka jika ada informasi baru. | P | Menetapkan pilihan agar bisa melanjutkan langkah berikutnya. | J |
| 19 | 4 | Untuk mengatur kegiatan sehari-hari, Anda lebih suka… | Mengikuti daftar atau urutan kegiatan yang sudah ditentukan. | J | Memilih kegiatan berikutnya sesuai keadaan saat itu. | P |
| 20 | 5 | Jika rencana berubah mendadak, kecenderungan pertama Anda adalah… | Melihat peluang baru dari perubahan tersebut. | P | Menyusun kembali rencana agar langkah berikutnya jelas. | J |

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
