export function homeMarkup() {
  return `<div class="home-page shell">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-intro">
        <p class="home-kicker"><span aria-hidden="true">✳</span> Kuis kepribadian singkat</p>
        <h1 id="home-title">Yuk, kenali<br><span>dirimu lebih dekat.</span></h1>
        <p class="home-description">Kadang kita lebih mudah memahami orang lain daripada diri sendiri. Luangkan 3 menit untuk mengenali cara kamu berpikir, mengambil keputusan, dan berhubungan dengan orang lain.</p>
        <a class="home-start" href="/kuis">Mulai kenali dirimu <span aria-hidden="true">↗</span></a>
        <p class="home-meta">Kurang lebih 3 menit <span aria-hidden="true">·</span> Tanpa akun</p>
      </div>
      <figure class="home-art">
        <img src="/assets/home.webp" width="1536" height="1024" alt="Ilustrasi orang muda berdiri di depan cermin dan tersenyum pada bayangannya." fetchpriority="high">
        
      </figure>
    </section>
    <section class="home-journey" aria-labelledby="home-journey-title">
      <div class="home-section-heading"><h2 id="home-journey-title">Mulai dari kebiasaan sehari-hari</h2></div>
      <ol class="home-steps">
        <li><span class="home-step-number">01</span><h3>Pilih jawabanmu</h3><p>Pilih yang paling sering kamu lakukan. Nggak ada jawaban benar atau salah.</p></li>
        <li><span class="home-step-number">02</span><h3>Kenali sisi dirimu</h3><p>Lihat kecenderungan, kekuatan, dan hal yang mungkin sering bikin kamu kesulitan.</p></li>
        <li><span class="home-step-number">03</span><h3>Bahas yang terasa cocok</h3><p>Ngobrol dengan AI untuk memahami hasilnya lewat contoh dari keseharianmu.</p></li>
      </ol>
    </section>
    <aside class="home-note" aria-label="Tentang akurasi kuis"><span aria-hidden="true">ⓘ</span><p>Kuis ini memakai teori MBTI untuk membantu kamu mengenali kebiasaanmu. Hasilnya belum divalidasi ahli dan tidak dijamin akurat. Untuk penilaian profesional, konsultasikan dengan ahli di bidangnya. <a href="/tentang">Tentang kuis ↗</a></p></aside>
  </div>`;
}
