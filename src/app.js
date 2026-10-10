import express from 'express';
import { fileURLToPath } from 'node:url';
import { quizRoutes } from './features/quiz/routes.js';
import { chatRoutes } from './features/chat/routes.js';
import { errorHandler } from './middleware/errors.js';
import { securityHeaders, rateLimit } from './middleware/security.js';

export function createApp({ config, repository, tokens, gemini, rateLimits = {} }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy || false);
  app.use(securityHeaders);
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const chatLimiter = rateLimit({ limit: rateLimits.chat || 30, windowMs: 10 * 60 * 1000 });
  const quizLimiter = rateLimit({ limit: rateLimits.quiz || 120, windowMs: 10 * 60 * 1000 });
  app.use('/api/chat', chatLimiter);
  app.use('/api/quiz', quizLimiter);
  app.use('/api', express.json({ limit: '8kb', strict: true }));
  app.get('/api/health', (req, res) => res.json({ success: true, data: { chatAvailable: gemini.available } }));
  app.use('/api/quiz', quizRoutes({ repository, tokens }));
  app.use('/api/chat', chatRoutes({ repository, tokens, gemini }));
  app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' }));
  const publicPath = fileURLToPath(new URL('../public/', import.meta.url));
  app.use(express.static(publicPath, { dotfiles: 'deny', index: false, etag: true, maxAge: 0 }));
  app.get(['/', '/kuis', '/hasil', '/tentang', '/privasi'], (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.sendFile('index.html', { root: publicPath });
  });
  app.use((req, res) => res.status(404).type('text').send('Halaman tidak ditemukan.'));
  app.use(errorHandler);
  app.locals.close = () => { chatLimiter.close(); quizLimiter.close(); };
  return app;
}
