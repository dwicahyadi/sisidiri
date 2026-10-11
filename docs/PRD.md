# PRD — SisiDiri

**Versi:** 1.2  
**Status:** Implementasi MVP tersedia; alur browser desktop/360 px dan satu pesan Gemini live diperiksa, verifikasi rilis belum lengkap  
**Platform:** Web responsif

**Keputusan 10 Oktober 2026:** frontend vanilla ES modules, Bahasa Indonesia, visual profesional/tenang, chat stateless dengan token bertanda tangan, batas 25 pesan di UI, dan pertanyaan orisinal yang disusun untuk proyek ini. Pengguna mengizinkan implementasi pada 10 Oktober 2026. Tambahkan catatan singkat tentang keterbatasan akurasi dan halaman penjelasan.

## 1. Ringkasan Produk

Aplikasi web untuk refleksi karakter berbasis kerangka MBTI. Pengunjung mengisi kuis mandiri berisi 20 pertanyaan, lalu menerima tipe MBTI, deskripsi, dan skor pada empat dimensi. Setelah hasil ditampilkan, pengunjung dapat berdiskusi dengan AI yang sudah memahami hasil tersebut.

Kuis **bukan** dilakukan lewat percakapan AI. AI hanya tersedia di halaman hasil sebagai konsultan reflektif.

## 2. Tujuan

- Memberikan pengalaman kuis singkat, jelas, dan nyaman di perangkat seluler maupun desktop.
- Menampilkan hasil MBTI yang mudah dipahami beserta dasar skornya.
- Memberikan ruang konsultasi AI yang kontekstual tanpa mengharuskan pengguna membuat akun.
- Tidak menyimpan identitas, jawaban, hasil kuis, atau riwayat chat pada database aplikasi.

## 3. Batasan dan Prinsip Produk

- MBTI digunakan sebagai alat refleksi/edukasi, bukan diagnosis psikologis atau klinis.
- Disclaimer UI: “Hasil ini tidak dijamin akurat dan belum divalidasi oleh ahli. Kuis ini hanya membantu refleksi berdasarkan teori MBTI; penilaian profesional memerlukan pemeriksaan oleh ahli di bidangnya.” Tampilkan sebagai catatan kecil yang terbaca pada beranda, kuis, dan hasil; sediakan halaman `/tentang` melalui menu dan tautan catatan.
- Tidak ada autentikasi, profil pengguna, dashboard riwayat, maupun fitur berbagi hasil pada MVP.
- SQLite hanya berisi data master: dimensi, pertanyaan, opsi jawaban, dan deskripsi 16 tipe MBTI.
- Jawaban kuis dan hasil hanya berada di memori browser selama pengguna membuka alur aplikasi; tidak ditulis ke SQLite.
- Backend memproses data sementara selama request tanpa menyimpannya. Token chat dan interaction ID hanya disimpan di memori browser; tidak masuk localStorage, sessionStorage, cookie, database aplikasi, analytics, atau log.
- Riwayat chat tidak disimpan oleh aplikasi. Namun, agar percakapan dapat berlanjut dengan `previous_interaction_id`, Interactions API menyimpan state percakapan pada layanan Gemini. Hal ini harus dijelaskan di halaman privasi.

## 4. Pengguna Sasaran

Pengunjung umum yang ingin mengenali kecenderungan karakter dan berdiskusi singkat tentang kekuatan, tantangan, gaya komunikasi, atau lingkungan kerja/belajar yang cocok menurut hasil MBTI.

## 5. Alur Pengguna

1. Pengunjung membuka halaman beranda.
2. Beranda menjelaskan tujuan situs, estimasi durasi (±5–7 menit), penafian non-klinis, dan tombol **Mulai Kuis**.
3. Pengunjung menjawab kuis secara berurutan: 4 dimensi × 5 pertanyaan = 20 pertanyaan.
4. Pada setiap pertanyaan, pengguna memilih satu dari dua pilihan yang mewakili kutub dimensi; lalu melanjutkan ke pertanyaan berikutnya.
5. Server memvalidasi 20 jawaban dan menghitung hasil tanpa menyimpannya ke database, lalu menerbitkan token chat bertanda tangan.
6. Halaman hasil menampilkan kode tipe, deskripsi, skor tiap dimensi, serta ajakan berkonsultasi dengan AI.
7. Pengunjung dapat mengirim pesan ke AI dari halaman hasil saja. AI menerima konteks tipe dan skor hasil kuis.
8. Setelah 25 pesan sukses, token kedaluwarsa, atau halaman ditutup/dimuat ulang/dimulai ulang, konsultasi berakhir dan tidak dapat dipulihkan dari aplikasi. Hasil yang masih ada di memori boleh tetap ditampilkan saat token kedaluwarsa.

## 6. Kebutuhan Fungsional

### 6.1 Beranda

- Judul dan penjelasan singkat tentang kuis MBTI.
- Beranda mengajak mengikuti kuis kurang lebih 3 menit; jumlah soal tidak ditonjolkan di home. Total tetap 20 pertanyaan.
- Penafian: hasil bukan diagnosis kesehatan mental/psikologis.
- Tombol utama **Ikuti kuis**.
- Redesign beranda: modern clean, ilustrasi home.png 1536 × 1024 px (3:2), serta satu disclaimer akurasi di akhir konten. Redesign kuis, hasil, dan chat diterapkan atas permintaan pengguna 11 Oktober 2026. Arahan aset final ada di [docs/HOME_DESIGN.md](HOME_DESIGN.md).

### 6.2 Kuis

- Terdiri dari empat dimensi: E–I, S–N, T–F, dan J–P.
- Setiap dimensi memiliki tepat lima pertanyaan aktif; total 20 pertanyaan.
- Satu pertanyaan memiliki dua opsi eksklusif, masing-masing memetakan ke satu kutub dimensi.
- Tampilkan nomor pertanyaan dan progress posisi; cukup satu instruksi pendek.
- Tombol **Kembali** harus mempertahankan jawaban yang sudah dipilih selama tab masih aktif.
- Klik pilihan langsung memajukan pertanyaan. Pilihan terakhir otomatis menghitung hasil; tombol Kembali mempertahankan jawaban dan memungkinkan perubahan. Kegagalan scoring mempertahankan jawaban agar dapat dicoba kembali.
- Pertanyaan ditampilkan satu per satu dan dapat diacak dalam dimensi yang sama bila flag `is_randomizable` aktif.
- Pengguna tidak dapat membuka halaman hasil jika jumlah jawaban belum 20 atau terdapat pertanyaan duplikat/tidak valid.
- Gunakan 20 pertanyaan orisinal di [QUESTION_BANK.md](QUESTION_BANK.md), lima per dimensi. Keduanya merupakan pilihan preferensi tanpa jawaban benar/salah. Pertanyaan tambahan tetap nonaktif.
- Bahasa awal Indonesia; visual profesional/tenang. Petunjuk menekankan kebiasaan sehari-hari, bukan jawaban yang dianggap ideal. Bank ini merupakan materi refleksi buatan proyek, bukan instrumen MBTI resmi atau instrumen yang telah divalidasi psikometrik.

### 6.3 Perhitungan Hasil

- Satu jawaban memberi satu poin pada salah satu kutub dimensi.
- Contoh: skor E=3 dan I=2 menghasilkan huruf `E`; skor S=1 dan N=4 menghasilkan `N`.
- Karena tiap dimensi terdiri dari lima pertanyaan, tidak ada nilai seri.
- Gabungkan huruf pemenang E/I, S/N, T/F, J/P menjadi satu tipe, misalnya `ENFP`.
- Ambil judul, ringkasan, kekuatan, tantangan, gaya komunikasi, dan rekomendasi refleksi dari master `personality_types`.
- UI menampilkan persentase dua kutub; API tetap mempertahankan skor mentah. Persentase bukan tingkat validitas ilmiah.

### 6.4 Halaman Hasil

- Menampilkan kode dan nama tipe, misalnya `INTJ — The Architect`.
- Ilustrasi hasil desktop berada di kiri pada sepertiga area konten; informasi tipe di kanan. Mobile bertumpuk dengan ilustrasi di atas.
- Menampilkan ilustrasi `public/assets/types/INFJ.png` sesuai kode tipe uppercase. Placeholder PNG 600 × 600 px, rasio 1:1.
- Detail ringkas dibagi menjadi tab Gambaran, Kekuatan, Tantangan, dan Komunikasi; tab dapat diakses keyboard dan layar ponsel.
- Menampilkan empat garis penuh yang terbagi dua warna dengan tingkat terang seimbang, berlabel persentase; tanpa skor pecahan atau caption pilihan:
  - Ekstrovert (E) — Introvert (I)
  - Sensing (S) — Intuition (N)
  - Thinking (T) — Feeling (F)
  - Judging (J) — Perceiving (P)
- Tombol mengambang membuka chat dengan sapaan sesuai tipe dan judul hasil. Desktop: dialog kecil, perbesar layar penuh, dan perkecil kembali ke tombol; ponsel: langsung layar penuh. Draft dan percakapan bertahan saat diperkecil. Enter mengirim, Shift+Enter membuat baris baru, dan input IME tidak mengirim saat komposisi.
- Disclaimer akurasi lengkap hanya di home dan halaman tentang; hasil menyediakan tautan batasan, tanpa mengulang disclaimer di kuis, tab, maupun chat. Informasi pemrosesan Gemini tetap terlihat sebelum pesan pertama.
- Chat tidak boleh muncul sebelum hasil kuis lengkap tersedia.

### 6.5 Konsultasi AI

- Chat hanya tersedia pada halaman hasil.
- Pada setiap request chat, frontend mengirim pesan dan `chatToken`. Token yang diterbitkan setelah scoring mengikat tipe serta empat skor tervalidasi. Server mengambil ringkasan/deskripsi dari SQLite; frontend tidak mengirim ulang `result` atau ringkasan.
- Token awal belum terikat interaction ID. Setelah respons AI sukses, server menerbitkan token pengganti yang mengikat `id` terbaru. Request lanjutan wajib menyertakan `previous_interaction_id` yang cocok dengan token tersebut.
- Server membangun `system_instruction` yang mewajibkan AI:
  - Menjadi kakak pendamping refleksi yang ramah, asik, suportif, dan mudah dipahami oleh generasi muda; memakai sapaan "Kak" atau "Kakak" secara natural tanpa mengulangnya di setiap kalimat.
  - Menggunakan bahasa sehari-hari yang sopan dan ringan, tanpa bahasa kaku, slang berlebihan, atau nada menggurui. Humor dan emoji hanya digunakan sesekali bila cocok.
  - Menjawab sesingkat mungkin dan langsung ke inti. Utamakan satu paragraf pendek, biasanya 1–3 kalimat atau 15–45 kata; gunakan paragraf kedua hanya bila benar-benar perlu. Hindari daftar kecuali diminta atau membantu kejelasan; ajukan maksimal satu pertanyaan lanjutan bila membantu.
  - Menggunakan hasil MBTI dan skor sebagai konteks, bukan kebenaran absolut.
  - Memperlakukan tipe sebagai bahan refleksi, bukan label tetap atau penentu kemampuan, kecocokan, masa depan, maupun keputusan pengguna.
  - Tidak mendiagnosis gangguan mental, memberi terapi, atau memberi keputusan penting atas nama pengguna.
  - Menyarankan bantuan profesional bila pengguna membahas risiko melukai diri sendiri/orang lain atau krisis.
  - Menjawab dalam Bahasa Indonesia kecuali pengguna meminta bahasa lain; tidak meminta identitas, data sensitif, atau seluruh jawaban kuis.
- UI membatasi 25 pesan pengguna yang memperoleh respons sukses; pesan ke-26 diblokir. Pesan gagal tidak menambah penghitung UI. Server memvalidasi maksimal 500 Unicode code points per pesan setelah trim, batas body, token, dan rate IP. Server stateless tidak menjamin batas keras 25 pesan per konsultasi atau mencegah replay/percabangan token.
- Respons AI ditargetkan satu paragraf pendek, biasanya 1–3 kalimat atau 15–45 kata; paragraf kedua hanya bila benar-benar perlu. Ini target gaya, bukan batas potong teks; jangan memotong respons secara buta. Krisis atau pertanyaan yang memerlukan kejelasan boleh dijawab lebih panjang.
- UI menampilkan penghitung seperti `3/25 pesan`, status memproses, dan pesan error yang ramah; hanya satu request chat boleh berjalan. Saat batas tercapai atau token kedaluwarsa, pengguna dapat memulai ulang kuis.
- Chat tidak perlu memiliki tombol hapus riwayat karena riwayat hanya berada di memori halaman selama sesi berjalan.

## 7. Arsitektur Teknis

### 7.1 Stack

- Runtime/backend: Node.js LTS dan Express.
- Frontend: SPA ringan vanilla JavaScript ES modules yang disajikan Express pada origin yang sama; Tailwind CSS.
- Database master: SQLite.
- AI SDK: `@google/genai`.
- API AI yang wajib digunakan: **Gemini Interactions API** melalui `ai.interactions.create()`; jangan menggunakan `models.generateContent()`.
- Backend stateless untuk konsultasi: tidak ada penyimpanan sesi atau percakapan. Penghitung rate limit IP sementara di memori proses diperbolehkan tanpa body request, hasil kuis, token, atau interaction ID.

### 7.2 Integrasi Gemini Interactions API

- Inisialisasi SDK hanya di backend menggunakan `GEMINI_API_KEY` dari environment variable. API key tidak pernah dikirim ke browser.
- Buat interaksi pertama saat pengguna mengirim pesan pertama dari hasil kuis:

```js
const interaction = await ai.interactions.create({
  model: process.env.GEMINI_MODEL,
  system_instruction: consultantInstruction,
  input: userMessage,
  store: true,
});
```

- Respons pesan diambil dari `interaction.output_text`.
- ID interaksi bawaan Gemini adalah **`interaction.id`**. Endpoint aplikasi juga mengembalikan key **`id`** tanpa mengubah namanya.
- Untuk pesan berikutnya, kirim `previous_interaction_id` dari `id` respons sebelumnya:

```js
const nextInteraction = await ai.interactions.create({
  model: process.env.GEMINI_MODEL,
  system_instruction: consultantInstruction,
  input: userMessage,
  previous_interaction_id: previousInteractionId,
  store: true,
});
```

- `previous_interaction_id` hanya dipakai untuk melanjutkan chat yang sama; ia tidak disimpan pada SQLite.
- Jangan menambahkan Google Search atau tools lain pada MVP agar konsultasi tetap fokus dan mudah dibatasi.
- Kirim `system_instruction` pada setiap interaksi; parameter tersebut tidak diwariskan hanya melalui ID. Lihat [dokumentasi resmi Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview). Model dikonfigurasi melalui `GEMINI_MODEL` dengan default awal `gemini-2.5-flash`. SDK yang ditargetkan `@google/genai` 2.28.0; koneksi live tetap perlu diperiksa dengan key yang valid.

### 7.3 Token Chat

- Gunakan token HMAC-SHA256 dengan secret backend terpisah `CHAT_TOKEN_SECRET`. Masa berlaku absolut 60 menit sejak scoring, tanpa perpanjangan ketika token diganti.
- Payload memuat versi, purpose khusus chat, waktu terbit/kedaluwarsa, tipe, empat skor, dan `previousInteractionId` (null pada token awal). Detail format dan pemeriksaan ada di [API_CONTRACT.md](API_CONTRACT.md).
- Signature membuktikan hasil pernah divalidasi endpoint scoring, bukan identitas pengguna atau bukti manusia mengisi kuis. Token adalah bearer credential dan dapat dibaca pemegangnya; signature tidak mengenkripsi payload.
- Verifikasi signature, expiry, schema skor, dan kecocokan interaction ID sebelum memanggil Gemini. Token hilang, invalid, atau kedaluwarsa tidak memicu panggilan provider.
- Token lama tidak dapat dicabut satu per satu tanpa state. Replay/percabangan tidak dicegah dalam MVP; kontrol biaya menggunakan rate limit IP dan konfigurasi provider. Batas keras per konsultasi memerlukan desain state tambahan di luar keputusan MVP ini.

## 8. Kontrak API

### `GET /api/quiz`

Mengembalikan `success: true` dan `data` berisi `dimensions` serta `questions`: empat dimensi dan 20 pertanyaan aktif dengan dua opsi per pertanyaan. Pole opsi tidak dikirim ke frontend. Field lengkap mengikuti [API_CONTRACT.md](API_CONTRACT.md).

### `POST /api/quiz/score`

Menerima seluruh jawaban, memvalidasi pertanyaan dan opsi terhadap database master, menghitung skor, lalu mengembalikan hasil MBTI. Tidak melakukan insert hasil/jawaban ke SQLite.

Request berisi `answers`, array 20 objek dengan `questionId` dan `optionId`. Respons menyertakan deskripsi master lengkap dan `chatToken` awal. Contoh berikut memakai hasil ENFP; teks deskripsi adalah contoh bentuk respons, bukan seed final.

Contoh respons sukses:

```json
{
  "success": true,
  "data": {
    "type": "ENFP",
    "title": "The Campaigner",
    "dimensions": [
      { "code": "EI", "left": "E", "leftScore": 4, "right": "I", "rightScore": 1 },
      { "code": "SN", "left": "S", "leftScore": 2, "right": "N", "rightScore": 3 },
      { "code": "TF", "left": "T", "leftScore": 1, "right": "F", "rightScore": 4 },
      { "code": "JP", "left": "J", "leftScore": 2, "right": "P", "rightScore": 3 }
    ],
    "shortDescription": "Contoh ringkasan reflektif.",
    "fullDescription": "Contoh deskripsi tipe untuk refleksi.",
    "strengths": ["Contoh kekuatan"],
    "challenges": ["Contoh tantangan"],
    "communicationStyle": "Contoh gaya komunikasi.",
    "reflectionTips": ["Contoh latihan refleksi"],
    "chatToken": "<token awal bertanda tangan>"
  }
}
```

### `POST /api/chat`

Endpoint ini hanya menerima request dengan token valid yang diterbitkan setelah scoring berhasil. Payload lama tanpa token ditolak; aplikasi belum memiliki client produksi yang memerlukan kompatibilitas kontrak v1.0.

Request pertama:

```json
{
  "message": "Bagaimana cara saya berkomunikasi lebih baik di kantor?",
  "chatToken": "<token awal dari scoring>"
}
```

Request lanjutan:

```json
{
  "message": "Boleh beri contoh kalimatnya?",
  "chatToken": "<token pengganti dari respons chat terakhir>",
  "previous_interaction_id": "<id dari respons sebelumnya>"
}
```

Respons sukses — mengikuti key ID bawaan Gemini:

```json
{
  "success": true,
  "message": "Sebagai ENFP dengan kecenderungan Feeling yang kuat, Anda dapat...",
  "id": "interaction_...",
  "chatToken": "<token pengganti yang mengikat id ini>"
}
```

Respons gagal:

```json
{
  "success": false,
  "message": "Maaf, konsultasi sedang tidak dapat diproses. Silakan coba lagi."
}
```

Frontend memperbarui `id` dan `chatToken` secara bersamaan setelah respons sukses. Server membaca skor dari token tervalidasi dan menormalisasikannya menjadi map konteks Gemini; tidak diperlukan konversi hasil di browser untuk request chat. Server tidak membuat tabel percakapan atau sesi.

## 9. Model Data SQLite

| Tabel | Kolom inti | Fungsi |
|---|---|---|
| `dimensions` | `id`, `code`, `name`, `left_label`, `right_label`, `sort_order`, `is_active` | Master empat dimensi |
| `questions` | `id`, `dimension_id`, `text`, `sort_order`, `is_active`, `is_randomizable` | 20 pertanyaan aktif; tambahan nonaktif |
| `question_options` | `id`, `question_id`, `text`, `pole`, `sort_order` | Dua opsi per pertanyaan (`E/I`, dst.) |
| `personality_types` | `code`, `title`, `short_description`, `full_description`, `strengths`, `challenges`, `communication_style`, `reflection_tips`, `is_active` | Master 16 tipe hasil |

Tidak dibuat tabel `users`, `quiz_attempts`, `answers`, `chat_histories`, atau `sessions`.

Field `strengths`, `challenges`, dan `reflection_tips` disimpan sebagai JSON TEXT berisi array string. `communication_style` berupa teks. Validasi master memastikan tepat empat dimensi, lima pertanyaan aktif per dimensi, dua opsi berpole berbeda per pertanyaan, dan 16 tipe aktif.

## 10. Validasi, Keamanan, dan Privasi

- Validasi payload di server memakai schema validator, misalnya Zod.
- Validasi bahwa 20 `questionId` unik, setiap opsi cocok dengan pertanyaan, dan semua dimensi terwakili tepat lima jawaban.
- Terapkan rate limit IP `/api/chat` sebesar 30 request per 10 menit; semua percobaan dihitung, termasuk kegagalan. Nilai ini memberi ruang 25 pesan dan beberapa retry manual. Ini pembatas request, bukan batas konsultasi. Tambahkan pembatas endpoint quiz/score saat implementasi agar penerbitan token tidak menjadi jalur abuse.
- Terapkan batas ukuran body request dan sanitasi/escape output chat saat dirender.
- `GEMINI_API_KEY`, `GEMINI_MODEL`, dan `CHAT_TOKEN_SECRET` berada di environment backend; `.env` diabaikan Git dan `.env.example` hanya berisi placeholder. Jangan mencatat body kuis/chat, token, atau interaction ID.
- Gunakan HTTPS di produksi dan security headers dasar. Implementasi memakai middleware eksplisit untuk CSP, nosniff, frame protection, referrer policy, permissions policy, serta HSTS pada HTTPS; tanpa dependensi Helmet tambahan.
- Tampilkan kebijakan privasi singkat sebelum chat: hasil tidak disimpan oleh aplikasi; pesan chat diproses oleh Gemini untuk menghasilkan jawaban dan state percakapan yang dirantai lewat interaction ID.
- Menutup tab atau mulai ulang tidak otomatis menghapus state Gemini. Jangan menjanjikan masa retensi tertentu tanpa memeriksa konfigurasi provider. Respons berisi hasil/token menggunakan `Cache-Control: no-store`.

## 11. Non-Functional Requirements

- Mobile-first; nyaman pada layar minimal 360 px.
- Waktu tampil halaman kuis dan hasil lokal <2 detik pada koneksi normal.
- State tombol dan progress kuis harus responsif; tidak ada AI call selama pengisian kuis.
- Aksesibilitas: label form jelas, navigasi keyboard, fokus terlihat, kontras Tailwind yang memadai.
- Error API tidak membocorkan stack trace, API key, atau detail provider.

## 12. Di Luar Ruang Lingkup MVP

- Login, akun pengguna, riwayat hasil, dan riwayat chat.
- Pengujian adaptif atau diagnosis psikologis.
- Pembayaran, admin panel, analitik identitas pengguna, ekspor PDF, dan berbagi ke sosial media.
- Rekomendasi klinis atau layanan darurat langsung.
- Enforcement keras 25 pesan di backend, pencabutan token individual, dan pencegahan replay berbasis penyimpanan sesi.

## 13. Kriteria Penerimaan

1. Pengunjung dapat menyelesaikan tepat 20 pertanyaan dan menerima satu dari 16 tipe MBTI.
2. Setiap hasil memperlihatkan empat skor dimensi dan deskripsi dari SQLite.
3. Tidak ada jawaban, hasil, akun, atau chat yang diinsert ke database aplikasi.
4. Chat hanya muncul setelah hasil valid ditampilkan; request tanpa token valid ditolak sebelum provider dipanggil.
5. Request chat pertama memakai `ai.interactions.create()` dan menghasilkan respons dengan `id: interaction.id`.
6. Request chat berikutnya memakai token pengganti dan `previous_interaction_id` yang cocok dengan `id` respons sebelumnya; setiap interaksi mengirim instruction server.
7. Respons `/api/chat` sukses selalu berisi `success`, `message`, `id`, dan `chatToken` pengganti.
8. UI mengizinkan 25 pesan sukses dan memblokir pesan ke-26; server memvalidasi panjang, token, body, serta rate limit. Tidak ada klaim batas keras per konsultasi di server.
9. API key Gemini tidak muncul di source frontend atau respons API.
10. Aplikasi menampilkan penafian MBTI non-klinis, tidak menjamin akurasi, menyebut perlunya penilaian ahli, serta menampilkan informasi privasi sebelum konsultasi AI. Menu `/tentang` menjelaskan bahwa bank belum divalidasi psikometrik.
11. Token invalid/kedaluwarsa atau interaction ID tidak cocok ditolak; signature tidak dianggap sebagai pencegahan replay.
12. Bank awal menggunakan 20 pertanyaan di QUESTION_BANK.md; masing-masing opsi bernilai satu pada pole yang tercantum.

## 14. Keputusan dan Langkah Berikutnya

Sudah diputuskan: Bahasa Indonesia, visual profesional/tenang, frontend vanilla ES modules, token stateless, batas 25 pesan di UI, ringkasan dari master server, dan pertanyaan orisinal yang disiapkan dalam dokumentasi. Pertanyaan tidak diambil dari tes resmi atau bank berlisensi; belum ada validasi psikometrik atau tinjauan psikolog.

Implementasi awal memakai Node.js 22.13+, Express 5.1.0, Zod 4.3.5, Tailwind 4.1.18, SQLite bawaan Node (`node:sqlite`), serta default model `gemini-2.5-flash`. Sebanyak 16 deskripsi tipe orisinal sudah tersedia di `database/personality-types.js`. SDK Google bersifat optional untuk menjalankan kuis lokal tanpa AI; produksi wajib memiliki SDK dan konfigurasi Gemini lengkap. SDK kini tersedia; alur browser serta satu pesan Gemini live telah diperiksa pada 11 Oktober 2026. Tinjau UI, keterbacaan, keseimbangan pertanyaan, dan Gemini live sebelum rilis; jangan mengklaim tinjauan psikolog tanpa bukti.

Dokumen pendukung: [ARCHITECTURE.md](ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md), [DATA_MODEL.md](DATA_MODEL.md), [QUESTION_BANK.md](QUESTION_BANK.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), dan [SELF_REVIEW.md](SELF_REVIEW.md).

## Pembaruan Bahasa dan Brand — 11 Oktober 2026

Nama aplikasi SisiDiri dengan ikon mark.svg. Redaksi ditujukan ke Gen Z dan milenial: konkret, singkat, memakai kamu/aku, tanpa slogan dan jargon motivasi. Font dipertahankan; ukuran teks isi diperbesar menjadi 16–18 px dengan kontras teks sekunder lebih baik. Panduan: [docs/COPY_GUIDE.md](COPY_GUIDE.md). Bank pertanyaan v1.1 mempertahankan ID/pole; seluruh deskripsi tipe dan master diperbarui.
