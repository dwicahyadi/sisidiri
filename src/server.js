import { createRuntime } from './runtime.js';

const { app, config, repository, gemini } = await createRuntime();
const server = app.listen(config.port, config.host, () => {
  console.log(`SisiDiri: http://${config.host}:${config.port}`);
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
