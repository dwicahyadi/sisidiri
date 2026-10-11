import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, siteSettings, robots, sitemap } from '../src/web/render.js';
import { sanitizePageView } from '../public/js/analytics.js';
import { createApp } from '../src/app.js';
import { requestApp } from './helpers/http.js';

const site = siteSettings({ VERCEL: '1', VERCEL_ENV: 'production', SITE_URL: 'https://sisidiri.example', VERCEL_ANALYTICS_ENABLED: 'true' });
test('HTML publik punya konten, canonical, meta sosial, dan indexing sesuai route', () => {
  for (const [path, heading] of [['/', 'Yuk, kenali'], ['/tentang', 'Tentang kuis SisiDiri'], ['/privasi', 'Data apa yang dipakai?']]) {
    const html = renderPage(path, site);
    assert.ok(html.includes(heading));
    assert.ok(html.includes(`rel="canonical" href="https://sisidiri.example${path}"`));
    assert.ok(html.includes('name="robots" content="index, follow"'));
    assert.ok(html.includes('property="og:image" content="https://sisidiri.example/assets/og-sisidiri.jpg"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  }
  for (const path of ['/kuis', '/hasil']) assert.ok(renderPage(path, site).includes('name="robots" content="noindex, follow"'));
  assert.ok(renderPage('/privasi', site).includes('Statistik kunjungan'));
  assert.ok(!renderPage('/tentang', site).includes('id="home-title"'));
});
test('preview tidak diindeks/analytics, origin tidak berasal dari Host request', () => {
  const preview = siteSettings({ VERCEL: '1', VERCEL_ENV: 'preview', SITE_URL: site.origin, VERCEL_ANALYTICS_ENABLED: 'true' });
  assert.equal(preview.analytics, false);
  assert.equal(preview.indexable, false);
  assert.equal(robots(preview), 'User-agent: *\nDisallow: /\n');
  assert.ok(!sitemap(preview).includes('<url>'));
  assert.ok(renderPage('/', preview).includes('name="robots" content="noindex, follow"'));
  assert.throws(() => siteSettings({ SITE_URL: 'https://example.com/path' }), /SITE_URL/);
  assert.throws(() => siteSettings({ SITE_URL: 'javascript:alert(1)' }), /SITE_URL/);
  assert.equal(siteSettings({ VERCEL_PROJECT_PRODUCTION_URL: 'demo.vercel.app' }).origin, 'https://demo.vercel.app');
});
test('sitemap hanya halaman publik; analytics tidak menerima query, hash, custom event atau path asing', () => {
  const xml = sitemap(site);
  assert.equal((xml.match(/<loc>/g) || []).length, 3);
  assert.ok(!xml.includes('/hasil'));
  assert.ok(!xml.includes('/kuis'));
  assert.equal(sanitizePageView({ type: 'event', url: `${site.origin}/hasil` }), null);
  assert.equal(sanitizePageView({ type: 'pageview', url: `${site.origin}/unknown` }), null);
  assert.equal(sanitizePageView({ type: 'pageview', url: `${site.origin}/hasil?type=INFJ&token=secret#private` }).url, `${site.origin}/hasil`);
});
test('HTTP lokal mengirim SEO route dan noindex API, bukan HTML home di semua URL', async () => {
  const app = createApp({ config: { site }, repository: {}, tokens: {}, gemini: { available: false } });
  try {
    const response = await requestApp(app, '/tentang', { headers: { Host: 'attacker.example' } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('Tentang kuis SisiDiri'));
    assert.ok(!html.includes('attacker.example'));
    assert.ok((await requestApp(app, '/hasil')).headers.get('x-robots-tag').includes('noindex'));
    assert.ok((await requestApp(app, '/api/health')).headers.get('x-robots-tag').includes('noindex'));
    assert.equal((await requestApp(app, '/unknown')).status, 404);
  } finally { app.locals.close(); }
});

 test('IP dari edge Vercel tidak dipercaya pada server lokal', async () => {
  const { clientIp } = await import('../src/middleware/security.js');
  const req = { ip: '127.0.0.1', headers: { 'x-forwarded-for': '203.0.113.8' } };
  assert.equal(clientIp(req), '127.0.0.1');
  assert.equal(clientIp(req, true), '203.0.113.8');
  assert.equal(clientIp({ ...req, headers: { 'x-forwarded-for': 'spoof, 203.0.113.8' } }, true), '127.0.0.1');
});
