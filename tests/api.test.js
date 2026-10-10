import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { seedDatabase } from '../database/seed.js';
import { MasterRepository } from '../src/infrastructure/database/repository.js';
import { createTokenService } from '../src/security/chat-token.js';
import { createApp } from '../src/app.js';
import { questions } from '../database/questions.js';
import { HttpError } from '../src/middleware/errors.js';
import { requestApp } from './helpers/http.js';

let directory, path, repository, app, beforeBytes;
let calls = [];
let providerFailure = false;
const validAnswers = questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id }));
const gemini = {
  available: true,
  async create(data) {
    calls.push(data);
    if (providerFailure) throw new HttpError(504, 'Konsultasi sedang tidak dapat diproses.');
    return { message: '<script>Ini harus dirender sebagai teks</script>', id: `interaction-${calls.length}` };
  },
};
before(async () => {
  directory = mkdtempSync(join(tmpdir(), 'personality-test-'));
  path = join(directory, 'master.sqlite');
  seedDatabase(path);
  seedDatabase(path); // Seed dapat diulang tanpa mengubah ID atau menggandakan baris.
  repository = new MasterRepository(path);
  beforeBytes = readFileSync(path);
  app = createApp({ config: { trustProxy: false }, repository, tokens: createTokenService(randomBytes(32)), gemini });
});
after(async () => {
  app.locals.close();
  repository.close();
  rmSync(directory, { recursive: true, force: true });
});
async function post(route, body) {
  const response = await requestApp(app, route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json(), response };
}

test('quiz hanya mengekspos master publik, skor memakai semua dimensi dan deskripsi', async () => {
  const response = await requestApp(app, '/api/quiz');
  const { data } = await response.json();
  assert.equal(data.questions.length, 20);
  assert.equal(data.dimensions.length, 4);
  assert.ok(data.questions.every((q) => q.options.length === 2 && q.options.every((o) => !('pole' in o))));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const scored = await post('/api/quiz/score', { answers: validAnswers });
  assert.equal(scored.status, 200);
  assert.equal(scored.body.data.dimensions.length, 4);
  assert.ok(scored.body.data.chatToken);
  assert.ok(scored.body.data.reflectionTips.length);
});

test('payload palsu, pertanyaan duplikat, opsi silang, dan field asing ditolak', async () => {
  for (const body of [
    { answers: [...validAnswers.slice(1), validAnswers[1]] },
    { answers: [{ questionId: 1, optionId: 4 }, ...validAnswers.slice(1)] },
    { answers: validAnswers, type: 'INTJ' },
    { answers: validAnswers.slice(1) },
  ]) assert.equal((await post('/api/quiz/score', body)).status, 400);
});

test('chat memverifikasi token/ID sebelum provider dan menerbitkan token kelanjutan', async () => {
  const scored = await post('/api/quiz/score', { answers: validAnswers });
  const token = scored.body.data.chatToken;
  const callCount = calls.length;
  assert.equal((await post('/api/chat', { message: 'Halo' })).status, 401);
  assert.equal((await post('/api/chat', { message: 'Halo', chatToken: 'invalid' })).status, 401);
  assert.equal((await post('/api/chat', { message: 'Halo', chatToken: token, previous_interaction_id: 'foreign' })).status, 400);
  assert.equal((await post('/api/chat', { message: 'x'.repeat(501), chatToken: token })).status, 400);
  assert.equal((await post('/api/chat', { message: 'Halo', chatToken: token, result: {} })).status, 400);
  assert.equal(calls.length, callCount);
  const first = await post('/api/chat', { message: 'Apa kekuatan saya?', chatToken: token });
  assert.equal(first.status, 200);
  assert.deepEqual(Object.keys(first.body).sort(), ['success', 'message', 'id', 'chatToken'].sort());
  assert.ok(calls.at(-1).instruction.includes('tidak dijamin akurat'));
  assert.equal((await post('/api/chat', { message: 'Lanjut', chatToken: first.body.chatToken, previous_interaction_id: 'wrong' })).status, 400);
  const next = await post('/api/chat', { message: 'Beri contoh', chatToken: first.body.chatToken, previous_interaction_id: first.body.id });
  assert.equal(next.status, 200);
  assert.equal(calls.at(-1).previousId, first.body.id);
  assert.ok(calls.at(-1).instruction.includes('Konteks tervalidasi server'));
});

test('provider timeout aman, malformed JSON/body besar ditolak, tanpa penulisan data pengguna', async () => {
  const scored = await post('/api/quiz/score', { answers: validAnswers });
  providerFailure = true;
  const failed = await post('/api/chat', { message: 'Halo', chatToken: scored.body.data.chatToken });
  providerFailure = false;
  assert.equal(failed.status, 504);
  assert.deepEqual(Object.keys(failed.body).sort(), ['success', 'message'].sort());
  const malformed = await requestApp(app, '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await post('/api/chat', { message: 'x'.repeat(9000) })).status, 413);
  assert.deepEqual(readFileSync(path), beforeBytes);
  const db = new DatabaseSync(path, { readOnly: true });
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((r) => r.name), ['dimensions', 'personality_types', 'question_options', 'questions']);
  db.close();
});

test('rate limit menghitung request gagal, header keamanan aktif, private paths tidak terlayani', async () => {
  const limitedApp = createApp({ config: {}, repository, tokens: createTokenService(randomBytes(32)), gemini, rateLimits: { chat: 1 } });
  try {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' };
    assert.equal((await requestApp(limitedApp, '/api/chat', options)).status, 401);
    const response = await requestApp(limitedApp, '/api/chat', options);
    assert.equal(response.status, 429);
    assert.ok(response.headers.get('retry-after'));
  } finally {
    limitedApp.locals.close();
  }
  const page = await requestApp(app, '/tentang');
  assert.equal(page.status, 200);
  assert.ok(page.headers.get('content-security-policy').includes("script-src 'self'"));
  assert.equal((await requestApp(app, '/.env')).status, 404);
  assert.equal((await requestApp(app, '/database/personality.sqlite')).status, 404);
});

test('master invalid menghentikan readiness', () => {
  const brokenPath = join(directory, 'broken.sqlite');
  seedDatabase(brokenPath);
  const db = new DatabaseSync(brokenPath);
  db.prepare('UPDATE questions SET is_active=0 WHERE id=1').run();
  db.close();
  assert.throws(() => new MasterRepository(brokenPath), /Master kuis tidak konsisten/);
});
