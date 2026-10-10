import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createTokenService } from '../src/security/chat-token.js';
import { scoreAnswers } from '../src/features/quiz/scoring.js';
import { questions } from '../database/questions.js';

const result = scoreAnswers(questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id })), questions);

test('token mengikat hasil dan ID, rotasi mempertahankan expiry absolut', () => {
  let now = 10000;
  const service = createTokenService(randomBytes(32), () => now);
  const token = service.issue(result);
  const first = service.verify(token);
  assert.equal(first.previousInteractionId, null);
  now += 120;
  const advanced = service.verify(service.advance(first, 'interaction-1'));
  assert.equal(advanced.previousInteractionId, 'interaction-1');
  assert.equal(advanced.exp, 13600);
  assert.deepEqual(advanced.dimensions, result.dimensions);
  // Stateless: token awal tetap valid, tanpa mengklaim pencabutan atau anti-replay.
  assert.equal(service.verify(token).previousInteractionId, null);
  now = 13600;
  assert.throws(() => service.verify(token), { status: 401 });
});

test('signature yang diubah, secret berbeda, token terlalu besar dan waktu di masa depan ditolak', () => {
  let now = 20000;
  const service = createTokenService(randomBytes(32), () => now);
  const token = service.issue(result);
  const [payload, signature] = token.split('.');
  const parsed = JSON.parse(Buffer.from(payload, 'base64url'));
  parsed.type = 'INTJ';
  assert.throws(() => service.verify(`${Buffer.from(JSON.stringify(parsed)).toString('base64url')}.${signature}`), { status: 401 });
  assert.throws(() => createTokenService(randomBytes(32), () => now).verify(token), { status: 401 });
  assert.throws(() => service.verify('x'.repeat(5000)), { status: 401 });
  assert.throws(() => service.verify('a.' + 'A'.repeat(43)), { status: 401 });
  now -= 1;
  assert.throws(() => service.verify(token), { status: 401 });
});
