export const routes = {
  '/': { title: 'SisiDiri - Kenali dirimu lewat kuis kepribadian', description: 'Kenali cara berpikir, mengambil keputusan, dan berkomunikasi lewat kuis kepribadian berdasarkan teori MBTI. Sekitar 3 menit, tanpa akun.', index: true },
  '/tentang': { title: 'Tentang kuis dan hasil kepribadian - SisiDiri', description: 'Pahami cara kerja kuis SisiDiri, arti persentase hasil, dan batas akurasinya. Hasil berdasarkan teori MBTI untuk refleksi diri, bukan diagnosis.', index: true },
  '/privasi': { title: 'Privasi dan penggunaan data - SisiDiri', description: 'Pelajari penggunaan jawaban kuis, percakapan AI, dan statistik kunjungan di SisiDiri. Tanpa akun dan tanpa menyimpan hasil di database aplikasi.', index: true },
  '/kuis': { title: 'Kuis kepribadian singkat - SisiDiri', description: 'Pilih jawaban yang paling dekat dengan kebiasaanmu untuk mengenali cara berpikir dan berkomunikasi. Kuis sekitar 3 menit, tanpa akun.', index: false },
  '/hasil': { title: 'Hasil kuis kepribadian - SisiDiri', description: 'Lihat kecenderungan, kekuatan, dan cara komunikasimu dari hasil kuis SisiDiri.', index: false },
};
export function updateMetadata(path) {
  const info = routes[path] || routes['/'];
  document.title = info.title;
  for (const [selector, content] of [
    ['meta[name="description"]', info.description], ['meta[property="og:title"]', info.title],
    ['meta[property="og:description"]', info.description], ['meta[name="twitter:title"]', info.title],
    ['meta[name="twitter:description"]', info.description],
  ]) document.querySelector(selector)?.setAttribute('content', content);
  const origin = document.querySelector('meta[name="site-origin"]')?.content;
  if (origin) {
    const url = new URL(path, origin).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  }
  const publicSite = document.querySelector('meta[name="site-indexable"]')?.content === 'true';
  document.querySelector('meta[name="robots"]')?.setAttribute('content', publicSite && info.index ? 'index, follow' : 'noindex, follow');
}
