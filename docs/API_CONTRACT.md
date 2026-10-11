# Kontrak API

Versi 1.2 — selaras PRD v1.2. Endpoint telah diimplementasikan; kontrak token v1.1 dipertahankan. Payload chat draft v1.0 tanpa token tidak didukung. Semua endpoint memakai JSON. Request dengan field yang tidak dikenal ditolak untuk menghindari kontrak ambigu.

## GET /api/quiz

Respons: `success: true`, `data.dimensions`, dan `data.questions`. Dimensi memuat `code`, `name`, `left`, `right` dalam urutan EI, SN, TF, JP. Pertanyaan memuat `id`, `dimensionCode`, `text`, `isRandomizable`, dan `options` berisi `id` serta `text`. Tepat 20 pertanyaan aktif dan dua opsi per pertanyaan. Pole opsi tetap di backend.

Bank awal mengikuti [QUESTION_BANK.md](QUESTION_BANK.md), urutan tetap dengan seluruh flag pengacakan nonaktif. Jika kelak diaktifkan, acak hanya di slot berflag aktif dalam dimensi yang sama dan pertahankan urutan selama alur kuis. Tidak ada endpoint penyimpanan jawaban parsial.

## POST /api/quiz/score

Request memiliki `answers`, array tepat 20 objek `questionId` dan `optionId`. Contoh bentuk satu elemen, bukan payload lengkap:

```json
{ "answers": [{ "questionId": 1, "optionId": 2 }] }
```

Validasi ID integer, keunikan pertanyaan, status aktif, opsi milik pertanyaan terkait, dan lima jawaban per dimensi. Hitung hasil di server tanpa menyimpannya.

Respons: `success: true` dan `data` dengan field berikut:

| Field | Bentuk |
|---|---|
| `type`, `title` | Kode empat huruf dan judul master |
| `dimensions` | Array empat elemen dengan `code`, `left`, `leftScore`, `right`, `rightScore` |
| `shortDescription`, `fullDescription`, `communicationStyle` | String dari master |
| `strengths`, `challenges`, `reflectionTips` | Array string dari master |
| `chatToken` | Token awal; `previousInteractionId` dalam token bernilai null |

Jumlah skor tiap dimensi tepat lima. Semua 16 tipe harus tersedia dalam master. Respons menggunakan `Cache-Control: no-store`.

## POST /api/chat

Request pertama:

```json
{
  "message": "Bagaimana cara saya berkomunikasi lebih baik?",
  "chatToken": "<token awal dari scoring>"
}
```

Request lanjutan:

```json
{
  "message": "Boleh beri contoh kalimatnya?",
  "chatToken": "<token pengganti terakhir>",
  "previous_interaction_id": "<id dari respons terakhir>"
}
```

Respons sukses:

```json
{
  "success": true,
  "message": "Jawaban AI",
  "id": "interaction_...",
  "chatToken": "<token pengganti yang mengikat id ini>"
}
```

Pada token awal, `previous_interaction_id` wajib tidak disertakan. Pada token kelanjutan, field tersebut wajib cocok persis dengan `previousInteractionId` dalam payload token. Browser mengganti token dan ID secara bersamaan setelah sukses. Tidak ada field `result` dalam request chat v1.1; contoh lama tidak lagi berlaku.

Server mengambil tipe dan skor dari token tervalidasi, menormalisasi array skor menjadi map konteks, lalu membaca deskripsi master. Browser tidak perlu mengubah hasil scoring menjadi map input chat. Setiap panggilan Gemini mengirim `system_instruction`. Respons memakai `Cache-Control: no-store`.

## Token Chat Bertanda Tangan

Format: `base64url(payload JSON).base64url(HMAC-SHA256 atas segmen payload terenkode)`. Algoritma ditetapkan server, tidak dipilih dari input. Gunakan `CHAT_TOKEN_SECRET` berupa secret acak minimal 32 byte setelah decoding konfigurasi base64; secret ini terpisah dari API key Gemini.

Payload memuat:

| Field | Aturan |
|---|---|
| `v`, `purpose` | `2` dan `personality-chat` |
| `sid`, `turn` | UUID acak dan counter integer 0–25; dicocokkan dengan state server |
| `iat`, `exp` | Unix timestamp detik; `exp = iat + 3600` saat scoring |
| `type`, `dimensions` | Hasil server; struktur array sama dengan hasil scoring |
| `previousInteractionId` | Null untuk awal, string ID provider terakhir untuk kelanjutan |

Verifikasi ukuran/format token, signature, schema payload, versi/purpose, waktu, empat pasangan skor integer 0–5 dengan jumlah lima, dan kesesuaian tipe. Tolak token dengan `iat` di masa depan atau `exp <= waktu server`. Bandingkan digest berukuran sama menggunakan operasi constant-time. Jangan mempercayai payload sebelum signature tervalidasi.

Setelah chat sukses, salin hasil, `iat`, dan `exp` ke token pengganti; interaction ID diperbarui dan turn bertambah satu. Masa berlaku absolut 60 menit, tidak diperpanjang. Request harus valid saat diterima; respons yang selesai setelah expiry tidak memperpanjang akses. Signature menjamin integritas hasil yang pernah discoring, bukan identitas atau pengisian kuis oleh manusia. Token dapat dibaca pemegangnya dan tidak berisi jawaban mentah atau teks chat.

Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia. Jangan bagikan bearer token atau memasukkannya ke URL, log, atau storage browser.

Sumber mekanisme HMAC dan perbandingan digest: [Node.js Crypto](https://nodejs.org/api/crypto.html), diperiksa 10 Oktober 2026. Format payload dan expiry adalah keputusan proyek.

## Batas dan Kegagalan

- UI mengizinkan 25 pesan dengan respons sukses; pesan ke-26 diblokir. Kegagalan tidak menambah penghitung. Hanya satu request berjalan; contoh indikator `3/25 pesan`.
- Server menerima 1–500 Unicode code points setelah trim. UI memakai definisi yang sama. Batas body JSON 8 KiB dan token maksimal 4 KiB.
- Rate limit IP chat: 30 request per 10 menit; semua percobaan dihitung. Respons 429 menyertakan `Retry-After`. Penghitung sementara tidak menyimpan isi request. Endpoint quiz/score dibatasi bersama pada 120 request/10 menit. Trusted proxy default nonaktif; konfigurasi hanya menerima IP/subnet tepercaya, bukan `true` atau jumlah hop.
- Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia.
- Respons AI ditargetkan sekitar 180 kata/1.200 karakter dengan instruction serta batas output provider yang sesuai model. Jangan potong teks secara buta; UI harus menangani respons sedikit lebih panjang.
- Jangan otomatis mengulang request provider yang timeout; interaksi mungkin sudah terbentuk. Kegagalan mempertahankan token/ID terakhir di browser dan menampilkan pesan ramah. Tidak ada asumsi idempotency atau pemulihan interaksi yang hilang.
- Token kedaluwarsa menghentikan chat; hasil boleh tetap terlihat. Untuk konsultasi baru, ulangi kuis. Error tidak mengembalikan token pengganti.

## Error HTTP

Semua error berisi `success: false` dan `message` ramah tanpa stack trace, token, atau detail provider.

| Status | Makna |
|---|---|
| 400 | Payload invalid atau interaction ID tidak sesuai token |
| 401 | Token hilang, invalid, atau kedaluwarsa |
| 413 | Body terlalu besar |
| 429 | Rate limit IP tercapai |
| 503 | Konsultasi belum tersedia karena konfigurasi/SDK tidak lengkap pada mode lokal |
| 502 / 504 | Provider gagal, respons kosong/tidak lengkap, atau timeout |
| 500 | Kegagalan internal |

## GET /api/health

Mengembalikan `success: true` dan `data.chatAvailable` boolean untuk status ketersediaan konfigurasi/SDK AI. Ini bukan probe konektivitas provider dan tidak memanggil Gemini. Startup memvalidasi master SQLite sebelum melayani request.

## Pembaruan keamanan 11 Oktober 2026

Server membatasi 25 balasan sukses per sesi dengan counter atomik dan token v2 (ID sesi acak, nomor giliran). Token lama ditolak setelah sukses; request bersamaan ditolak 409. Redis bersama wajib di produksi, tanpa fallback ke memori. Rate IP chat 30/10 menit dan kuis 120/10 menit berlaku lintas instance. CHAT_DAILY_LIMIT default 200 membatasi percobaan provider per hari UTC, termasuk kegagalan. Ini bukan autentikasi atau bukti pengguna manusia.

Redis hanya menyimpan ID sesi acak, nomor giliran/status request sampai expiry absolut 60 menit, HMAC alamat IP untuk penghitung 10 menit, dan agregat harian sampai pergantian hari UTC + 60 detik. Jawaban, hasil, chat, token, dan interaction ID tidak disimpan di Redis, SQLite, analytics, atau log aplikasi. Memori lokal hanya untuk development.

Counter hanya bertambah setelah respons provider sukses. Kegagalan provider melepas status pending untuk retry manual, tetap menghabiskan kuota harian. Redis timeout/error mengembalikan 503; proses terputus saat pending tidak otomatis membuka ulang sesi. Token v1 ditolak, pengguna lama perlu mengulang kuis. Berbagi token masih berbagi akses, bukan membuat identitas baru.
