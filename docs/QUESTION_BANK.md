# Bank Pertanyaan Refleksi

Versi 1.2 — 13 Oktober 2026. Pertanyaan dan pilihan memakai bahasa obrolan sehari-hari untuk Gen Z dan milenial; ID, urutan, pole, dan makna pasangan dipertahankan. Materi orisinal yang disusun oleh asisten untuk proyek SisiDiri sesuai instruksi pengguna. Status: konten awal sudah masuk seed melalui database/questions.js; pemeriksaan keterbacaan bersama calon pengguna tetap diperlukan sebelum rilis. Ini bukan butir tes MBTI resmi, bukan salinan instrumen berlisensi, dan belum divalidasi psikometrik atau ditinjau psikolog.

## Petunjuk untuk Pengunjung

Pilih yang paling sering kamu lakukan, bukan yang terasa paling ideal. Kalau keduanya cocok, pilih yang paling menggambarkan kebiasaanmu belakangan ini. Tidak ada jawaban benar atau salah. Hasil membantu refleksi dan tidak menentukan kemampuan, nilai diri, atau diagnosis.

## Aturan Master dan Scoring

Tepat 20 pertanyaan aktif; masing-masing dimensi EI, SN, TF, JP memiliki lima pertanyaan. Satu pilihan memberi satu poin pada pole yang tercantum. Total skor setiap dimensi lima, sehingga tidak ada seri. Urutan huruf hasil selalu E/I, S/N, T/F, J/P.

`ID` pada tabel menjadi `questions.id`; `Urutan` menjadi `sort_order` dalam dimensi. Seluruh pertanyaan awal memakai `is_active = 1` dan `is_randomizable = 0` untuk menjaga urutan yang mudah diaudit. Label A/B hanya label tampilan; jangan menyimpulkan pole dari posisi opsi. `question_options.id` mengikuti tabel terakhir. Pole adalah metadata backend dan tidak dikirim dalam API kuis.

## EI — Ekstrovert / Introvert

Fokus refleksi: kecenderungan berinteraksi dan memulihkan energi, bukan kemampuan bersosialisasi.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 1 | 1 | Habis hari yang capek, kamu biasanya ngapain? | Ketemu dan ngobrol sama orang yang aku suka. | E | Sendiri dulu di tempat yang tenang. | I |
| 2 | 2 | Kalau lagi cari solusi buat masalah sehari-hari, kamu mulai dari mana? | Mikir sendiri dulu. | I | Ngobrol dulu sama orang lain. | E |
| 3 | 3 | Pas ketemu orang-orang baru, kamu biasanya ngapain? | Mulai ngajak ngobrol biar kenal. | E | Lihat-lihat suasana dulu, baru ikut ngobrol. | I |
| 4 | 4 | Kalau lagi senggang di akhir pekan, kamu lebih suka ngapain? | Ngisi waktu dengan kegiatan sendiri. | I | Bikin kegiatan bareng teman atau keluarga. | E |
| 5 | 5 | Pas diskusi bareng, kamu biasanya nyampein ide dengan cara apa? | Ngomong sambil mikirin idenya. | E | Mikirin idenya dulu, baru ngomong. | I |

## SN — Sensing / Intuition

Fokus refleksi: informasi yang lebih dahulu diperhatikan, bukan kecerdasan atau kreativitas.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 6 | 1 | Kalau belajar hal baru, kamu lebih suka mulai dari mana? | Ngerti ide besarnya dan bisa dipakai buat apa aja. | N | Lihat contoh nyata dan cara pakainya langsung. | S |
| 7 | 2 | Pas cerita pengalaman, kamu lebih sering bahas apa? | Apa yang kejadian dan detail yang aku ingat. | S | Pelajaran atau hubungan antar kejadian yang aku tangkap. | N |
| 8 | 3 | Kalau ngerjain tugas yang udah biasa kamu lakukan, kamu pilih cara yang mana? | Nyoba cara lain yang kayaknya cocok. | N | Pakai cara yang selama ini udah terbukti membantu. | S |
| 9 | 4 | Kalau baca panduan, kamu lebih suka bagian apa yang dijelasin dulu? | Langkah-langkah yang bisa langsung aku ikuti. | S | Gambaran besarnya: ini buat apa dan kenapa caranya begitu. | N |
| 10 | 5 | Pas lihat rencana baru, apa yang pertama kamu pikirin? | Nanti bisa dikembangin jadi apa aja, ya? | N | Fakta yang ada dan apa yang dibutuhin sekarang. | S |

## TF — Thinking / Feeling

Fokus refleksi: pertimbangan yang didahulukan saat mengambil keputusan, bukan kemampuan berpikir atau memiliki empati.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 11 | 1 | Kalau ada dua pilihan yang sama-sama bisa diambil, apa yang kamu pikirin dulu? | Alasan dan plus minus tiap pilihan. | T | Efek tiap pilihan buat orang-orang yang terlibat. | F |
| 12 | 2 | Kalau mau kasih masukan ke teman, apa yang kamu pikirin dulu? | Gimana caranya supaya dia bisa nerima masukanku. | F | Bagian mana yang perlu dibenerin. | T |
| 13 | 3 | Kalau dua orang beda pendapat soal keputusan bareng, apa yang kamu cari tahu dulu? | Kalau pakai ukuran yang sama, alasan mana yang lebih kuat? | T | Masing-masing sebenarnya butuh apa? | F |
| 14 | 4 | Kalau ada aturan yang terasa kurang pas buat situasinya, apa yang kamu pikirin dulu? | Kondisi orang yang kena aturan itu. | F | Kenapa aturan itu perlu berlaku sama buat semua orang. | T |
| 15 | 5 | Habis ambil keputusan yang sulit, apa yang kamu pertanyakan ke diri sendiri? | Alasanku tadi masuk akal, nggak? | T | Keputusan tadi sesuai sama prinsip yang aku pegang, nggak? | F |

## JP — Judging / Perceiving

Fokus refleksi: kecenderungan mengatur kegiatan dan menyikapi pilihan, bukan kedisiplinan atau kualitas tanggung jawab.

| ID | Urutan | Pertanyaan | Pilihan A | Pole A | Pilihan B | Pole B |
|---|---|---|---|---|---|---|
| 16 | 1 | Kalau mau liburan, kamu lebih suka ngatur kegiatannya dengan cara apa? | Milih mau ngapain sesuai suasana nanti. | P | Nentuin kegiatan utamanya dari sebelum berangkat. | J |
| 17 | 2 | Kalau mulai tugas yang deadline-nya masih lama, gimana kamu ngatur langkah kerjanya? | Nyusun langkah kerjanya dari awal. | J | Nentuin langkah berikutnya sambil jalan. | P |
| 18 | 3 | Kalau udah ada beberapa pilihan yang oke, kamu lebih suka ngapain? | Tetap buka pilihan, siapa tahu ada info baru. | P | Nentuin pilihan biar bisa lanjut. | J |
| 19 | 4 | Buat kegiatan sehari-hari, gimana kamu nentuin mau ngapain dulu? | Ngikutin daftar atau urutan yang udah aku bikin. | J | Milih mau ngapain berikutnya sesuai keadaan. | P |
| 20 | 5 | Kalau rencana tiba-tiba berubah, apa yang pertama kamu lakukan? | Cari kegiatan atau pilihan baru yang jadi mungkin. | P | Atur ulang rencana biar tahu habis ini mau ngapain. | J |

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
