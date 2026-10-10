import { existsSync } from 'node:fs';
import { loadConfig } from './config/env.js';
import { MasterRepository } from './infrastructure/database/repository.js';
import { createGeminiClient } from './infrastructure/gemini/client.js';
import { createTokenService } from './security/chat-token.js';
import { createApp } from './app.js';

const config = loadConfig();
if (!existsSync(config.databasePath)) throw new Error('Database belum tersedia. Jalankan npm run db:seed terlebih dahulu.');
const repository = new MasterRepository(config.databasePath);
const gemini = await createGeminiClient(config);
const app = createApp({ config, repository, tokens: createTokenService(config.tokenSecret), gemini });
const server = app.listen(config.port, config.host, () => {
  console.log(`Personality Insight AI: http://${config.host}:${config.port}`);
  if (config.ephemeralSecret) console.log('Mode lokal: token berakhir jika server dimulai ulang. Atur CHAT_TOKEN_SECRET untuk secret tetap.');
  if (!gemini.available) console.log('Kuis aktif. Konsultasi AI belum aktif; lengkapi konfigurasi Gemini dan SDK.');
});
server.requestTimeout = 45000;
server.headersTimeout = 15000;
const shutdown = () => {
  app.locals.close();
  server.close(() => { repository.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.on('error', (error) => {
  app.locals.close(); repository.close();
  console.error(error.code === 'EADDRINUSE' ? 'Port sudah dipakai. Pilih PORT lain.' : `Server tidak dapat dimulai (${error.code || 'UNKNOWN'}).`);
  process.exitCode = 1;
});
