import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { siteSettings } from '../web/render.js';

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production' || env.VERCEL === '1';
  if (env.CHAT_ENABLED && !['true', 'false'].includes(env.CHAT_ENABLED)) throw new Error('CHAT_ENABLED harus true atau false.');
  const chatEnabled = env.CHAT_ENABLED !== 'false';
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
  if (production && chatEnabled && (!env.GEMINI_API_KEY?.trim() || !env.GEMINI_MODEL?.trim())) {
    throw new Error('GEMINI_API_KEY dan GEMINI_MODEL wajib di produksi.');
  }
  const trustProxy = env.TRUST_PROXY?.trim();
  const redisUrl = env.UPSTASH_REDIS_REST_URL?.trim() || '';
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';
  if (Boolean(redisUrl) !== Boolean(redisToken)) throw new Error('Isi UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN bersama.');
  if (redisUrl) {
    let url;
    try { url = new URL(redisUrl); } catch { throw new Error('UPSTASH_REDIS_REST_URL tidak valid.'); }
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.upstash.io') || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) throw new Error('UPSTASH_REDIS_REST_URL harus origin HTTPS Upstash.');
  }
  if (production && !redisUrl) throw new Error('UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN wajib di produksi.');
  if (trustProxy && /^(true|\d+)$/i.test(trustProxy)) {
    throw new Error('TRUST_PROXY harus IP/subnet proxy tepercaya, bukan true atau jumlah hop.');
  }
  return {
    production,
    redisUrl,
    redisToken,
    chatDailyLimit: number('CHAT_DAILY_LIMIT', 200, 1, 100000),
    chatEnabled,
    vercel: env.VERCEL === '1',
    site: siteSettings(env),
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
