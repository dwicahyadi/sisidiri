import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../database/questions.js';
import { personalityTypes } from '../database/personality-types.js';
import { scoreAnswers, isValidResult } from '../src/features/quiz/scoring.js';

test('20 jawaban menghasilkan seluruh 16 tipe dan empat pasangan skor yang konsisten', () => {
  for (const { code } of personalityTypes) {
    const answers = questions.map((q) => {
      const pole = Array.from(code).find((p) => q.dimensionCode.includes(p));
      return { questionId: q.id, optionId: q.options.find((o) => o.pole === pole).id };
    });
    const result = scoreAnswers(answers, questions);
    assert.equal(result.type, code);
    assert.ok(isValidResult(result));
    assert.ok(result.dimensions.every((d) => Math.max(d.leftScore, d.rightScore) === 5));
  }
});

test('scoring memvalidasi duplikat, pilihan silang, dan jawaban yang kurang', () => {
  const answers = questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id }));
  assert.throws(() => scoreAnswers(answers.slice(1), questions), { status: 400 });
  assert.throws(() => scoreAnswers([...answers.slice(1), answers[1]], questions), { status: 400 });
  assert.throws(() => scoreAnswers([{ questionId: 1, optionId: 4 }, ...answers.slice(1)], questions), { status: 400 });
});

test('hasil dengan tipe palsu, skor pecahan, pasangan salah, atau dimensi ganda ditolak', () => {
  const result = scoreAnswers(questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id })), questions);
  assert.ok(isValidResult(result));
  assert.equal(isValidResult({ ...result, type: 'XXXX' }), false);
  const fractional = structuredClone(result); fractional.dimensions[0].leftScore = 2.5;
  assert.equal(isValidResult(fractional), false);
  const duplicate = structuredClone(result); duplicate.dimensions[1] = duplicate.dimensions[0];
  assert.equal(isValidResult(duplicate), false);
});
