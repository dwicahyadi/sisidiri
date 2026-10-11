// Hanya page view; jangan tambahkan jawaban, tipe, pesan, token, atau custom event.
const allowedPaths = new Set(['/', '/kuis', '/hasil', '/tentang', '/privasi']);
export function sanitizePageView(event) {
  if (event.type !== 'pageview') return null;
  try {
    const url = new URL(event.url);
    if (!allowedPaths.has(url.pathname)) return null;
    url.search = ''; url.hash = '';
    return { type: 'pageview', url: url.href };
  } catch { return null; }
}
if (typeof document !== 'undefined' && document.querySelector('meta[name="analytics-enabled"]')?.content === 'true') {
  window.va = window.va || function (...args) { (window.vaq = window.vaq || []).push(args); };
  window.va('beforeSend', sanitizePageView);
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.append(script);
}
