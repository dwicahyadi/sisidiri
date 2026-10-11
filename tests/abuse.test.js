import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryGuard, RedisGuard, createGuard } from '../src/infrastructure/abuse/guard.js';

const payload = (sid = 'test-session') => ({ sid, turn: 0, exp: Math.floor(Date.now() / 1000) + 3600 });
test('25 balasan, replay, request bersamaan, dan sesi tidak terdaftar dibatasi', async () => {
  const guard = new MemoryGuard();
  try {
    let current = payload();
    await guard.register(current);
    for (let turn = 0; turn < 25; turn++) {
      current = { ...current, turn };
      const owner = await guard.claim(current);
      await assert.rejects(guard.claim(current), { status: 409 });
      await guard.finish(current, owner, true);
      await assert.rejects(guard.claim(current), { status: 401 });
    }
    await assert.rejects(guard.claim({ ...current, turn: 25 }), { status: 401 });
    await assert.rejects(guard.claim(payload('unknown')), { status: 401 });
  } finally { guard.close(); }
});
test('gagal provider boleh retry tetapi tetap menghabiskan kuota global lintas sesi', async () => {
  const guard = new MemoryGuard({ dailyLimit: 2 });
  try {
    const first = payload('first'), second = payload('second');
    await guard.register(first); await guard.register(second);
    const owner = await guard.claim(first);
    await guard.finish(first, owner, false);
    const retry = await guard.claim(first);
    await guard.finish(first, retry, true);
    await assert.rejects(guard.claim(second), { status: 429 });
    assert.equal((await guard.rate('chat', '192.0.2.1', 1, 600)).allowed, true);
    assert.equal((await guard.rate('chat', '192.0.2.1', 1, 600)).allowed, false);
    assert.ok([...guard.entries.keys()].every((key) => !key.includes('192.0.2.1')));
  } finally { guard.close(); }
});
test('state kedaluwarsa dan pending tidak terbuka kembali otomatis', async () => {
  let now = 1000;
  const guard = new MemoryGuard({ now: () => now });
  try {
    const current = { ...payload(), exp: 1100 };
    await guard.register(current); await guard.claim(current);
    now = 1099;
    await assert.rejects(guard.claim(current), { status: 409 });
    now = 1100;
    await assert.rejects(guard.claim(current), { status: 401 });
  } finally { guard.close(); }
});
test('Redis error, timeout, dan respons rusak gagal tertutup; produksi tidak fallback', async () => {
  assert.throws(() => createGuard({ production: true }), /Redis/);
  for (const fetcher of [async () => { throw new Error('offline'); }, async () => ({ ok: false }), async () => ({ ok: true, json: async () => ({ error: 'ERR' }) }), async () => ({ ok: true, json: async () => ({ result: null }) })]) {
    const guard = new RedisGuard({ url: 'https://test.upstash.io', token: 'fake', fetcher });
    await assert.rejects(guard.rate('chat', '192.0.2.1', 30, 600), { status: 503 });
  }
});
test('Redis REST memakai EVAL dan TTL; key IP di-HMAC tanpa konten pengguna', async () => {
  const commands = [];
  const guard = new RedisGuard({ url: 'https://test.upstash.io', token: 'fake', fetcher: async (url, options) => {
    commands.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: commands.length === 1 ? [1, 600] : 1 }) };
  } });
  await guard.rate('chat', '192.0.2.1', 30, 600);
  await guard.register(payload());
  assert.equal(commands[0][0], 'EVAL');
  assert.equal(commands[0].at(-1), '600');
  assert.ok(!JSON.stringify(commands).includes('192.0.2.1'));
  assert.ok(Number(commands[1].at(-1)) <= 3600);
});
