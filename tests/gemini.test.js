import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeminiClient } from '../src/infrastructure/gemini/client.js';

const config = { apiKey: 'test-key-not-real', model: 'gemini-2.5-flash', timeoutMs: 30000, maxOutputTokens: 800 };
test('adapter memakai Interactions API, instruction setiap turn, chaining, timeout dan tanpa retry', async () => {
  const calls = [];
  class FakeSDK {
    constructor() {
      this.interactions = { create: async (params, options) => {
        calls.push({ params, options });
        return { status: 'completed', output_text: ' Jawaban utuh. ', id: `id-${calls.length}` };
      } };
    }
  }
  const client = await createGeminiClient(config, FakeSDK);
  assert.equal(client.available, true);
  const first = await client.create({ instruction: 'aturan refleksi', message: 'Halo' });
  await client.create({ instruction: 'aturan refleksi', message: 'Lanjut', previousId: first.id });
  assert.equal(first.message, 'Jawaban utuh.');
  assert.equal(calls[0].params.previous_interaction_id, undefined);
  assert.equal(calls[1].params.previous_interaction_id, 'id-1');
  for (const { params, options } of calls) {
    assert.equal(params.system_instruction, 'aturan refleksi');
    assert.equal(params.store, true);
    assert.equal(params.generation_config.max_output_tokens, 800);
    assert.equal(options.timeout_ms, 30000);
    assert.deepEqual(options.retries, { strategy: 'none' });
  }
});

test('adapter menolak respons kosong/tidak lengkap dan menyembunyikan detail kegagalan provider', async () => {
  for (const reply of [{ id: 'id', output_text: '' }, { id: 'id', output_text: 'setengah', status: 'in_progress' }, { output_text: 'tanpa id' }]) {
    class FakeSDK { interactions = { create: async () => reply }; }
    const client = await createGeminiClient(config, FakeSDK);
    await assert.rejects(() => client.create({ instruction: 'aturan', message: 'Halo' }), { status: 502 });
  }
  class TimeoutSDK { interactions = { create: async () => { throw new Error('timeout secret provider detail'); } }; }
  const client = await createGeminiClient(config, TimeoutSDK);
  await assert.rejects(() => client.create({ instruction: 'aturan', message: 'Halo' }), (error) => error.status === 504 && !error.message.includes('secret'));
  assert.equal((await createGeminiClient({ ...config, apiKey: '' })).available, false);
});
