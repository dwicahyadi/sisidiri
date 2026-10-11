# Bahasa dan Keterbacaan SisiDiri

Diperbarui 11 Oktober 2026. Nama produk **SisiDiri**; ikon aplikasi/header memakai `public/assets/mark.svg`. Font tetap Inter/Segoe UI/system sesuai stack yang sudah ada.

## Bahasa

- Sasaran Gen Z dan milenial. UI menyapa dengan kamu; pilihan jawaban memakai aku. Chat memanggil pengguna Kak/Kakak dan menyebut dirinya aku.
- Tulis apa yang pengguna bisa lakukan atau apa yang terjadi. Contoh: “Cara pakainya”, “Pilih jawabanmu”, “Lihat hasilnya”. Hindari slogan berulang, jargon motivasi, pujian otomatis, serta istilah seperti “ruang bertumbuh” dan “eksplorasi perspektif”.
- Tombol singkat dan jelas: Ikuti kuis, Kembali, Kirim, Ulangi kuis.
- Home mengajak pengguna mengenali diri: “Yuk, kenali dirimu lebih dekat.” CTA “Mulai kenali dirimu” mengarah ke kuis; manfaat dijelaskan lewat cara berpikir, mengambil keputusan, dan berhubungan dengan orang lain.
- Hasil memakai bahasa kemungkinan, bukan kepastian. Deskripsi tipe ringkas dan memakai contoh kebiasaan sehari-hari. Label dimensi disederhanakan tanpa mengubah kutub/scoring.
- Disclaimer lengkap pada home dan Tentang. Kuota dan status chat dijelaskan saat relevan. Informasi pemrosesan dan penyimpanan data oleh layanan AI tetap diberikan sebelum pesan pertama. UI memakai istilah AI tanpa menyebut merek atau stack penyedia.
- Bank 20 pertanyaan dan 40 pilihan disunting untuk keterbacaan; ID, urutan, pole, dan makna pasangan dipertahankan. QUESTION_BANK.md mengikuti seed. Semua 16 deskripsi tipe diperbarui dan master di-seed ulang.

## Keterbacaan

Semua halaman memakai lebar konten yang sama dengan home melalui `.shell`: maksimal 1160 px, dengan margin responsif. Wrapper isi kuis, Tentang, dan Privasi mengikuti seluruh lebar container tersebut.

Teks isi 16–18 px; label/navigasi/tab 14–15 px, teks bantuan 13–14 px. Chat 16 px dan textarea minimal 16 px. Warna teks sekunder lebih gelap; line-height isi sekitar 1.7–1.8. Judul besar mengikuti viewport. Tab tampil dua kolom pada ponsel agar teks tetap terbaca tanpa scroll horizontal. Font tetap; header/footer ringkas tanpa tagline tambahan.

## Pemeriksaan

Build, syntax, enam berkas test unit/integrasi, dan seed lulus. Browser diperiksa pada desktop dan 360 px, termasuk copy terbaru serta ukuran font dan layout. Capture screenshot browser sedang timeout; pemeriksaan menggunakan DOM dan geometri layout. Keyboard virtual perangkat fisik dan uji keterbacaan dengan pengguna belum dilakukan.
