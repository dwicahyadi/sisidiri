import express from 'express';
import { fileURLToPath } from 'node:url';
import { quizRoutes } from './features/quiz/routes.js';
import { chatRoutes } from './features/chat/routes.js';
import { errorHandler } from './middleware/errors.js';
import { securityHeaders, clientIp } from './middleware/security.js';
import { createGuard } from './infrastructure/abuse/guard.js';
import { renderPage, robots, sitemap, siteSettings } from './web/render.js';

export function createApp({ config, repository, tokens, gemini, rateLimits = {}, guard = createGuard(config) }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy || false);
  app.use(securityHeaders);
  const site = config.site || siteSettings();
  if (!site.indexable) app.use((req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });
  app.use('/api', (req, res, next) => { res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }); next(); });
  const limiter = (bucket, limit) => async (req, res, next) => {
    const result = await guard.rate(bucket, clientIp(req, config.vercel), limit, 600);
    if (!result.allowed) {
      res.set('Retry-After', String(result.retryAfter));
      return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Tunggu sebentar sebelum mencoba lagi.' });
    }
    next();
  };
  app.use('/api/chat', limiter('chat', rateLimits.chat || 30));
  app.use('/api/quiz', limiter('quiz', rateLimits.quiz || 120));
  app.use('/api', express.json({ limit: '8kb', strict: true }));
  app.get('/api/health', (req, res) => res.json({ success: true, data: { chatAvailable: gemini.available } }));
  app.use('/api/quiz', quizRoutes({ repository, tokens, guard }));
  app.use('/api/chat', chatRoutes({ repository, tokens, gemini, guard }));
  app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' }));
  const publicPath = fileURLToPath(new URL('../public/', import.meta.url));
  app.get('/robots.txt', (req, res) => res.type('text').send(robots(site)));
  app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemap(site)));
  app.get('/index.html', (req, res) => res.redirect(308, '/'));
  app.get(['/kuis.html', '/hasil.html', '/tentang.html', '/privasi.html'], (req, res) => res.redirect(308, req.path.replace(/\.html$/, '')));
  app.get(['/', '/kuis', '/hasil', '/tentang', '/privasi'], (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.path === '/hasil' || req.path === '/kuis') res.set('X-Robots-Tag', 'noindex, follow');
    res.type('html').send(renderPage(req.path, site));
  });
  app.use(express.static(publicPath, { dotfiles: 'deny', index: false, etag: true, maxAge: '1h' }));
  app.use((req, res) => res.status(404).type('text').send('Halaman tidak ditemukan.'));
  app.use(errorHandler);
  app.locals.close = () => { guard.close(); };
  return app;
}
