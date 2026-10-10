import { Router } from 'express';
import { answersSchema } from './schema.js';
import { scoreAnswers } from './scoring.js';
import { HttpError } from '../../middleware/errors.js';

export function quizRoutes({ repository, tokens }) {
  const router = Router();
  router.get('/', (req, res) => {
    const dimensions = repository.getDimensions().map((d) => ({ code: d.code, name: d.name, left: d.leftLabel, right: d.rightLabel }));
    const questions = repository.getQuestions().map((q) => ({ ...q, options: q.options.map(({ id, text }) => ({ id, text })) }));
    res.json({ success: true, data: { dimensions, questions } });
  });
  router.post('/score', (req, res) => {
    const parsed = answersSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Lengkapi 20 jawaban dengan pilihan yang valid.');
    const result = scoreAnswers(parsed.data.answers, repository.getQuestions());
    const personality = repository.getType(result.type);
    if (!personality) throw new Error('Master tipe tidak tersedia.');
    res.json({ success: true, data: { ...personality, ...result, chatToken: tokens.issue(result) } });
  });
  return router;
}
