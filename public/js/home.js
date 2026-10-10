import { disclaimer } from './copy.js';

const icon = (name) => {
  const shapes = {
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 11h6M9 15h6"/>',
    chart: '<path d="M5 19h14M7 15v-4M12 15V6M17 15V9"/>',
    chat: '<path d="M5 5h14v11H9l-4 4V5Z"/><path d="M9 9h6M9 12h4"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.chat}</svg>`;
};
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function homeMarkup() {
  return `<div class="shell">
    <section class="hero" aria-labelledby="hero-title">
      <div><p class="eyebrow">Kenali diri, temukan perspektif</p>
        <h1 id="hero-title">Ada banyak sisi<br>dalam dirimu.<br><em>Mari mengenalnya.</em></h1>
        <p class="hero-description">Luangkan sedikit waktu untuk memahami cara kamu berpikir, berinteraksi, dan mengambil keputusan. Mulai dari sebuah refleksi sederhana.</p>
        <div class="hero-actions"><a class="button button-primary" href="/kuis">Mulai kenali diri <span aria-hidden="true">↗</span></a><a class="text-link" href="/tentang">Tentang kuis ini</a></div>
        <div class="hero-meta"><span>${icon('list')}20 pertanyaan</span><span>${icon('clock')}±5–7 menit</span><span>${icon('shield')}Tanpa akun</span></div>
      </div>
      <div class="insight-visual" role="img" aria-label="Contoh kartu hasil ENFP dengan empat skor dimensi; bukan hasil Anda">
        <div class="visual-aura"></div><div class="personality-card"><div class="card-top"><span>SEBUAH GAMBARAN TENTANGMU</span><span>✧</span></div><div class="card-type"><span>E</span><span>N</span><span>F</span><span>P</span></div><p class="card-title">Penghubung Kemungkinan</p>
          ${[['E','I','e'],['S','N','n'],['T','F','f'],['J','P','p']].map(([a,b,c]) => `<div class="sample-scale"><span>${a}</span><div class="track"><div class="fill sample-fill-${c}"></div></div><span>${b}</span></div>`).join('')}
          <div class="card-foot"><span>UNIK, SEPERTI DIRIMU.</span><span>↗</span></div></div>
        <div class="float-note"><span class="sparkle">✧</span><span>Setiap sisi punya cerita.</span></div><span class="visual-caption">Ilustrasi hasil · bukan hasil kuismu</span>
      </div>
    </section>
    <aside class="hero-disclaimer" aria-label="Catatan akurasi"><span class="info-mark" aria-hidden="true">ⓘ</span><p>${escape(disclaimer)} <a href="/tentang">Baca selengkapnya</a></p></aside>
    <section class="steps-section" aria-labelledby="steps-title"><div class="section-heading"><h2 id="steps-title">Langkah kecil. Perspektif baru.</h2><p>Ruang refleksi yang sederhana, dari awal sampai akhir.</p></div><div class="steps-grid">
      ${[['list','01','Jawab dengan jujur','Pilih jawaban yang paling dekat dengan kebiasaanmu. Tidak ada jawaban benar atau salah.'],['chart','02','Kenali kecenderunganmu','Lihat gambaran tipe dan empat dimensi kepribadian, lengkap dengan dasar skornya.'],['chat','03','Temukan sudut pandang','Diskusikan hasilmu bersama AI untuk mengeksplorasi kekuatan dan ruang bertumbuh.']].map(([i,n,t,d]) => `<article class="step-card"><div class="step-top"><span class="step-icon">${icon(i)}</span><span class="step-number">${n}</span></div><h3>${t}</h3><p>${d}</p></article>`).join('')}
    </div></section>
    <section class="dimensions-strip" aria-label="Empat dimensi refleksi"><p>Empat dimensi untuk<br>memahami kecenderunganmu</p><div class="dimensions-pills">${[['E · I','Energi & interaksi'],['S · N','Cara menerima informasi'],['T · F','Pertimbangan keputusan'],['J · P','Cara mengatur kegiatan']].map(([c,l]) => `<div class="dimension-pill"><span class="dimension-code">${c}</span><span>${l}</span></div>`).join('')}</div></section>
  </div>`;
}

