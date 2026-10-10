import { Router } from 'express';
import { chatSchema } from './schema.js';
import { consultantInstruction } from './instruction.js';
import { HttpError } from '../../middleware/errors.js';

export function chatRoutes({ repository, tokens, gemini }) {
  const router = Router();
  router.post('/', async (req, res) => {
    if (!req.body?.chatToken) throw new HttpError(401, 'Selesaikan kuis sebelum menggunakan konsultasi.');
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Pesan harus berisi 1–500 karakter dengan data konsultasi yang valid.');
    const { message, chatToken, previous_interaction_id: previousId } = parsed.data;
    const payload = tokens.verify(chatToken);
    if (payload.previousInteractionId === null ? previousId !== undefined : previousId !== payload.previousInteractionId) {
      throw new HttpError(400, 'Alur konsultasi tidak cocok. Silakan mulai ulang kuis.');
    }
    if (!gemini.available) throw new HttpError(503, 'Konsultasi AI belum tersedia. Hasil refleksi Anda tetap dapat dibaca.');
    const personality = repository.getType(payload.type);
    if (!personality) throw new Error('Master tipe tidak tersedia.');
    const answer = await gemini.create({ instruction: consultantInstruction(payload, personality), message, previousId });
    res.json({ success: true, message: answer.message, id: answer.id, chatToken: tokens.advance(payload, answer.id) });
  });
  return router;
}
