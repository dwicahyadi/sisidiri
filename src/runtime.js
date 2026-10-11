import { existsSync } from 'node:fs';
import { loadConfig } from './config/env.js';
import { MasterRepository } from './infrastructure/database/repository.js';
import { createGeminiClient } from './infrastructure/gemini/client.js';
import { createTokenService } from './security/chat-token.js';
import { createApp } from './app.js';

export async function createRuntime() {
  const config = loadConfig();
  if (!existsSync(config.databasePath)) throw new Error('Database belum tersedia. Jalankan npm run db:seed terlebih dahulu.');
  const repository = new MasterRepository(config.databasePath);
  try {
    const gemini = config.chatEnabled ? await createGeminiClient(config) : { available: false };
    const app = createApp({ config, repository, tokens: createTokenService(config.tokenSecret), gemini });
    return { app, config, repository, gemini };
  } catch (error) { repository.close(); throw error; }
}
