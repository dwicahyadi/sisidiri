import { HttpError } from '../../middleware/errors.js';

export const DIMENSIONS = [
  { code: 'EI', left: 'E', right: 'I' },
  { code: 'SN', left: 'S', right: 'N' },
  { code: 'TF', left: 'T', right: 'F' },
  { code: 'JP', left: 'J', right: 'P' },
];

export function isValidResult(result) {
  if (!result || !Array.isArray(result.dimensions) || result.dimensions.length !== 4) return false;
  let type = '';
  for (const [index, expected] of DIMENSIONS.entries()) {
    const item = result.dimensions[index];
    if (!item || item.code !== expected.code || item.left !== expected.left || item.right !== expected.right) return false;
    if (![item.leftScore, item.rightScore].every((n) => Number.isInteger(n) && n >= 0 && n <= 5)) return false;
    if (item.leftScore + item.rightScore !== 5) return false;
    type += item.leftScore > item.rightScore ? item.left : item.right;
  }
  return result.type === type;
}

export function scoreAnswers(answers, questions) {
  if (answers.length !== 20 || new Set(answers.map((a) => a.questionId)).size !== 20) {
    throw new HttpError(400, 'Lengkapi 20 pertanyaan yang berbeda sebelum melihat hasil.');
  }
  const byId = new Map(questions.map((q) => [q.id, q]));
  const counts = Object.fromEntries(DIMENSIONS.map((d) => [d.code, { [d.left]: 0, [d.right]: 0 }]));
  for (const answer of answers) {
    const question = byId.get(answer.questionId);
    const option = question?.options.find((o) => o.id === answer.optionId);
    if (!question || !option) throw new HttpError(400, 'Ada jawaban yang tidak cocok dengan pertanyaan kuis.');
    counts[question.dimensionCode][option.pole] += 1;
  }
  const dimensions = DIMENSIONS.map((d) => ({ ...d, leftScore: counts[d.code][d.left], rightScore: counts[d.code][d.right] }));
  if (dimensions.some((d) => d.leftScore + d.rightScore !== 5)) throw new HttpError(400, 'Setiap dimensi harus memiliki lima jawaban.');
  const type = dimensions.map((d) => d.leftScore > d.rightScore ? d.left : d.right).join('');
  return { type, dimensions };
}
