import { readFileSync } from 'node:fs';
import { homeMarkup } from '../../public/js/home.js';
import { aboutMarkup, privacyMarkup } from '../../public/js/pages.js';
import { routes } from '../../public/js/seo.js';

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function siteSettings(env = process.env) {
  const candidate = env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  let origin = '';
  if (candidate) {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('SITE_URL harus origin tanpa path, query, atau kredensial.');
    if (env.VERCEL && url.protocol !== 'https:') throw new Error('SITE_URL di Vercel wajib HTTPS.');
    origin = url.origin;
  }
  const production = env.VERCEL ? env.VERCEL_ENV === 'production' : env.NODE_ENV === 'production';
  if (env.VERCEL && production && !origin) throw new Error('Isi SITE_URL atau aktifkan VERCEL_PROJECT_PRODUCTION_URL.');
  return { origin, indexable: production && Boolean(origin), analytics: production && env.VERCEL_ANALYTICS_ENABLED === 'true', verification: env.GOOGLE_SITE_VERIFICATION?.trim() || '' };
}
export function renderPage(path, settings = siteSettings(), template = readFileSync(new URL('../../public/index.html', import.meta.url), 'utf8')) {
  const info = routes[path];
  if (!info) throw new Error('Halaman tidak dikenal.');
  const canonical = settings.origin ? new URL(path, settings.origin).href : '';
  const image = settings.origin ? `${settings.origin}/assets/og-sisidiri.jpg` : '';
  const tag = (name, content, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escape(content)}">`;
  const meta = [
    tag('description', info.description), tag('robots', settings.indexable && info.index ? 'index, follow' : 'noindex, follow'),
    tag('site-origin', settings.origin), tag('site-indexable', String(settings.indexable)),
    tag('analytics-enabled', String(settings.analytics)),
    ...(settings.verification ? [tag('google-site-verification', settings.verification)] : []),
    tag('og:type', 'website', true), tag('og:site_name', 'SisiDiri', true), tag('og:locale', 'id_ID', true),
    tag('og:title', info.title, true), tag('og:description', info.description, true),
    tag('twitter:card', 'summary_large_image'), tag('twitter:title', info.title), tag('twitter:description', info.description),
    ...(canonical ? [`<link rel="canonical" href="${escape(canonical)}">`, tag('og:url', canonical, true), tag('og:image', image, true), tag('og:image:width', '1200', true), tag('og:image:height', '630', true), tag('og:image:alt', 'SisiDiri - Yuk, kenali dirimu lebih dekat.', true), tag('twitter:image', image), tag('twitter:image:alt', 'SisiDiri - Yuk, kenali dirimu lebih dekat.')] : []),
  ].join('\n    ');
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(info.title)}</title>`);
  html = html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, `<!--seo-->${meta}<!--/seo-->`);
  const content = path === '/' ? homeMarkup() : path === '/tentang' ? aboutMarkup() : path === '/privasi' ? privacyMarkup() : `<div class="shell page-wrap"><h1>${path === '/kuis' ? 'Kuis kepribadian SisiDiri' : 'Hasil kuismu'}</h1><p>${path === '/kuis' ? 'Aktifkan JavaScript untuk mulai mengisi kuis.' : 'Isi kuis terlebih dahulu untuk melihat hasilmu.'}</p><a class="button button-primary" href="/kuis">Ikuti kuis</a></div>`;
  return html.replace(/<!--app-home-->[\s\S]*?<!--\/app-home-->/, `<!--app-home-->${content}<!--/app-home-->`);
}
export function robots(settings) {
  return settings.indexable ? `User-agent: *\nDisallow: /api/\nAllow: /\nSitemap: ${settings.origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
}
export function sitemap(settings) {
  const urls = settings.indexable ? Object.entries(routes).filter(([, value]) => value.index).map(([path]) => `<url><loc>${escape(new URL(path, settings.origin).href)}</loc></url>`).join('') : '';
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
