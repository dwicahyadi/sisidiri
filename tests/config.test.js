import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { loadConfig } from '../src/config/env.js';

test('mode produksi wajib secret tetap dan konfigurasi Gemini lengkap', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /CHAT_TOKEN_SECRET/);
  const env = { NODE_ENV: 'production', CHAT_TOKEN_SECRET: randomBytes(32).toString('base64') };
  assert.throws(() => loadConfig(env), /GEMINI_API_KEY/);
  const config = loadConfig({ ...env, GEMINI_API_KEY: 'not-a-real-key', GEMINI_MODEL: 'gemini-2.5-flash' });
  assert.equal(config.ephemeralSecret, false);
  assert.equal(config.trustProxy, false);
});
test('konfigurasi lokal tidak membutuhkan key, menolak secret/port/proxy yang tidak aman', () => {
  const local = loadConfig({});
  assert.equal(local.tokenSecret.length, 32);
  assert.equal(local.ephemeralSecret, true);
  assert.throws(() => loadConfig({ CHAT_TOKEN_SECRET: 'short' }), /CHAT_TOKEN_SECRET/);
  assert.throws(() => loadConfig({ PORT: 'hello' }), /PORT/);
  assert.throws(() => loadConfig({ TRUST_PROXY: 'true' }), /TRUST_PROXY/);
  assert.throws(() => loadConfig({ TRUST_PROXY: '1' }), /TRUST_PROXY/);
});
