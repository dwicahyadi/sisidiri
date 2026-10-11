# Desain Kuis, Hasil, dan Chat — 11 Oktober 2026

## Perilaku

- Home: CTA Ikuti kuis, durasi kurang lebih 3 menit; tanpa jumlah soal. Total kuis tetap 20.
- Kuis: tombol pilihan langsung maju; Kembali mempertahankan pilihan, termasuk saat mengubah jawaban. Pilihan terakhir memicu scoring. Saat scoring, kontrol dikunci; error mempertahankan jawaban.
- Hero hasil desktop: ilustrasi di kiri, mengisi sepertiga area grid; informasi tipe di kanan mengisi dua pertiga. Mobile tetap bertumpuk dengan ilustrasi di atas.
- Hasil: empat garis utuh dua warna teal/terracotta dengan luminans seimbang. Label menampilkan persentase, tanpa skor pecahan. API/scoring tidak berubah.
- Detail memakai tab Gambaran, Kekuatan, Tantangan, Komunikasi. Navigasi keyboard: panah kiri/kanan, Home, End. Mobile menumpuk grafik dan tab.
- Chat: launcher pada hasil; dialog mengambang desktop dengan kontrol layar penuh dan perkecil. Mobile langsung layar penuh. Escape memperkecil; native dialog menjaga fokus. Draft, riwayat, ID, token, dan penghitung tetap ada saat diperkecil. Navigasi/reload mengikuti batas state memori sebelumnya.
- Enter mengirim; Shift+Enter membuat baris baru. IME tidak mengirim saat komposisi. Batas 25 pesan sukses, 500 karakter, dan expiry dipertahankan.
- Sapaan awal memakai tipe dan judul dari hasil. Sapaan lokal ini tidak memanggil provider atau mengurangi kuota. Informasi pemrosesan Gemini tampil sebelum pesan pertama.
- Disclaimer akurasi hanya sekali pada home dan penjelasan lengkap di Tentang. Hasil menyediakan tautan; kuis/tab/chat tidak mengulangnya.

## Ilustrasi Tipe

Placeholder tersedia di `public/assets/types/`, menggunakan kode uppercase: ISTJ.png, ISFJ.png, INFJ.png, INTJ.png, ISTP.png, ISFP.png, INFP.png, INTP.png, ESTP.png, ESFP.png, ENFP.png, ENTP.png, ESTJ.png, ESFJ.png, ENFJ.png, ENTJ.png.

Ukuran **600 × 600 px**, rasio **1:1**, PNG transparan. Ganti file dengan nama yang sama. Ilustrasi final disarankan berupa karakter muda dengan aktivitas/objek yang menggambarkan tema reflektif tiap tipe, gaya flat vector sederhana, palet sage/mint/cream dan aksen peach. Sisakan ruang aman 10%; tanpa teks di gambar. Placeholder saat ini berupa siluet generik dengan aksen warna, belum menggambarkan karakter unik setiap tipe.

## Pemeriksaan

Build dan syntax lulus, enam berkas unit/integrasi lulus. Browser lokal: alur 20 pertanyaan, kembali dan mengganti jawaban, scoring, pemuatan PNG, tab klik/keyboard, buka/perbesar/perkecil dialog, Enter/Shift+Enter, draft saat diperkecil, dan hasil/chat pada viewport 360 × 800 diperiksa. Satu pesan contoh berhasil mendapat respons Gemini live. Ini tidak menguji seluruh 16 tampilan tipe, seluruh kondisi jaringan, 25 pesan live, atau keyboard virtual perangkat fisik.
