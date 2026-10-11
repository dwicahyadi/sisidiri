# Desain Home

Ruang lingkup: beranda saja. Dokumen ini mencatat desain home; kuis, hasil, dan chat kemudian diperbarui atas permintaan 11 Oktober 2026. Header/footer bersama dipertahankan. Gaya modern clean: judul sans serif besar, warna hijau lembut, satu aksi utama, serta tiga langkah tanpa kartu dekoratif. CSS baru memakai prefix `home-` di dalam `.home-page`.

Disclaimer akurasi tampil sekali di bagian akhir konten home, dengan tautan ke halaman tentang. Halaman hasil cukup menautkan batasan; kuis dan chat tidak mengulang disclaimer akurasi.

## Aset Home Saat Ini

Home menggunakan `public/assets/home.png` yang disediakan pengguna, ukuran 1536 × 1024 px (3:2). Dimensi HTML dan CSS mengikuti rasio aset tanpa memotong gambar. Arahan placeholder awal di bawah adalah referensi historis.

## Arahan Ilustrasi Awal

- Ganti `public/assets/home-reflection-placeholder.svg` dengan ilustrasi editorial flat/vector: satu orang muda duduk santai di depan cermin, menggambarkan refleksi diri, dengan daun dan aksen bintang secukupnya.
- Gaya: bentuk organik sederhana, garis minimal, hijau forest/sage, mint, cream, dan aksen peach. Hindari teks, logo, bingkai UI, atau kode tipe kepribadian di dalam gambar.
- Ukuran: **1200 × 1000 px**, rasio **6:5**. Sediakan ruang aman sekitar 10% di tepi. Komposisi harus terbaca pada lebar 320 px.
- Format: SVG untuk vector atau WebP transparan, idealnya kurang dari 200 KB. Background panel disediakan oleh CSS. Jika format diganti, sesuaikan `src` dan deskripsi `alt` di `public/js/home.js`, lalu build ulang.

## Pemeriksaan

Build CSS dan prerender home memakai `npm run build`. Jalankan `npm run check` untuk syntax. Pemeriksaan tambahan dan status browser tercatat di docs/QUIZ_RESULT_DESIGN.md. Jangan menganggap placeholder sebagai ilustrasi final.
