import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAT_LIMIT, canSendChat, messageLength } from '../public/js/chat-state.js';

const ready = { count: 0, pending: false, expired: false, available: true, message: 'Apa yang bisa saya refleksikan?' };
test('UI mengizinkan pesan ke-25 dan memblokir ke-26, pending, expired, serta AI unavailable', () => {
  assert.equal(CHAT_LIMIT, 25);
  assert.equal(canSendChat({ ...ready, count: 24 }), true);
  assert.equal(canSendChat({ ...ready, count: 25 }), false);
  for (const change of [{ pending: true }, { expired: true }, { available: false }]) assert.equal(canSendChat({ ...ready, ...change }), false);
});
test('panjang pesan menghitung Unicode code points setelah trim', () => {
  assert.equal(messageLength('  🙂🙂  '), 2);
  assert.equal(canSendChat({ ...ready, message: '🙂'.repeat(500) }), true);
  assert.equal(canSendChat({ ...ready, message: '🙂'.repeat(501) }), false);
  assert.equal(canSendChat({ ...ready, message: '   ' }), false);
});
