import { Router } from 'express';
import { chatSchema } from './schema.js';
import { consultantInstruction } from './instruction.js';
import { HttpError } from '../../middleware/errors.js';

export function chatRoutes({ repository, tokens, gemini, guard }) {
  const router = Router();
  router.post('/', async (req, res) => {
    if (!req.body?.chatToken) throw new HttpError(401, 'Isi kuis dulu sebelum membuka chat.');
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Tulis pesan 1–500 karakter. Kalau chat tidak bisa dilanjutkan, ulangi kuis.');
    const { message, chatToken, previous_interaction_id: previousId } = parsed.data;
    const payload = tokens.verify(chatToken);
    if (payload.previousInteractionId === null ? previousId !== undefined : previousId !== payload.previousInteractionId) {
      throw new HttpError(400, 'Chat ini tidak bisa dilanjutkan. Ulangi kuis untuk mulai lagi.');
    }
    if (!gemini.available) throw new HttpError(503, 'Chat AI belum tersedia. Kamu tetap bisa membaca hasil kuismu.');
    const personality = repository.getType(payload.type);
    if (!personality) throw new Error('Master tipe tidak tersedia.');
    const owner = await guard.claim(payload);
    let answer;
    try {
      answer = await gemini.create({ instruction: consultantInstruction(payload, personality), message, previousId });
    } catch (error) {
      // Kegagalan tetap menghabiskan kuota harian provider; retry dibatasi rate bersama.
      await guard.finish(payload, owner, false);
      throw error;
    }
    const nextToken = tokens.advance(payload, answer.id);
    await guard.finish(payload, owner, true);
    res.json({ success: true, message: answer.message, id: answer.id, chatToken: nextToken });
  });
  return router;
}
