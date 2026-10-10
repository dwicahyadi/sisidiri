import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const number = (name, fallback, min, max) => {
    const value = Number(env[name] || fallback);
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`Konfigurasi ${name} tidak valid.`);
    }
    return value;
  };
  const encoded = env.CHAT_TOKEN_SECRET?.trim();
  if (production && !encoded) throw new Error('CHAT_TOKEN_SECRET wajib di produksi.');
  if (encoded && (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || Buffer.from(encoded, 'base64').length < 32)) {
    throw new Error('CHAT_TOKEN_SECRET harus base64 dengan minimal 32 byte acak.');
  }
  if (production && (!env.GEMINI_API_KEY?.trim() || !env.GEMINI_MODEL?.trim())) {
    throw new Error('GEMINI_API_KEY dan GEMINI_MODEL wajib di produksi.');
  }
  const trustProxy = env.TRUST_PROXY?.trim();
  if (trustProxy && /^(true|\d+)$/i.test(trustProxy)) {
    throw new Error('TRUST_PROXY harus IP/subnet proxy tepercaya, bukan true atau jumlah hop.');
  }
  return {
    production,
    host: env.HOST || '127.0.0.1',
    port: number('PORT', 3000, 1, 65535),
    databasePath: resolve(env.DATABASE_PATH || 'database/personality.sqlite'),
    tokenSecret: encoded ? Buffer.from(encoded, 'base64') : randomBytes(32),
    ephemeralSecret: !encoded,
    apiKey: env.GEMINI_API_KEY?.trim() || '',
    model: env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
    timeoutMs: number('GEMINI_TIMEOUT_MS', 30000, 1000, 120000),
    maxOutputTokens: number('GEMINI_MAX_OUTPUT_TOKENS', 800, 128, 2048),
    trustProxy: trustProxy || false,
  };
}
