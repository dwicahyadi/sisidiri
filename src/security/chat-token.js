import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from '../middleware/errors.js';
import { isValidResult } from '../features/quiz/scoring.js';

const dimension = z.object({
  code: z.string(), left: z.string(), right: z.string(),
  leftScore: z.number().int(), rightScore: z.number().int(),
}).strict();
const payloadSchema = z.object({
  v: z.literal(1), purpose: z.literal('personality-chat'),
  iat: z.number().int().nonnegative(), exp: z.number().int().positive(),
  type: z.string(), dimensions: z.array(dimension).length(4),
  previousInteractionId: z.string().min(1).max(1024).nullable(),
}).strict();

export function createTokenService(secret, now = () => Math.floor(Date.now() / 1000)) {
  if (!Buffer.isBuffer(secret) || secret.length < 32) throw new Error('Secret token tidak valid.');
  const sign = (payload) => {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const digest = createHmac('sha256', secret).update(encoded).digest('base64url');
    return `${encoded}.${digest}`;
  };
  return {
    issue(result) {
      if (!isValidResult(result)) throw new Error('Hasil scoring tidak valid.');
      const iat = now();
      return sign({ v: 1, purpose: 'personality-chat', iat, exp: iat + 3600,
        type: result.type, dimensions: result.dimensions, previousInteractionId: null });
    },
    verify(token) {
      const invalid = () => new HttpError(401, 'Akses chat sudah berakhir atau tidak dikenali. Ulangi kuis untuk mulai lagi.');
      if (typeof token !== 'string' || Buffer.byteLength(token) > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) throw invalid();
      const [encoded, signature] = token.split('.');
      const expected = createHmac('sha256', secret).update(encoded).digest();
      const actual = Buffer.from(signature, 'base64url');
      if (actual.toString('base64url') !== signature || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw invalid();
      let payload;
      try { payload = payloadSchema.parse(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))); } catch { throw invalid(); }
      if (payload.iat > now() || payload.exp <= now() || payload.exp !== payload.iat + 3600 || !isValidResult(payload)) throw invalid();
      return payload;
    },
    advance(payload, id) {
      if (typeof id !== 'string' || !id.trim() || id.length > 1024) throw new Error('Interaction ID tidak valid.');
      return sign({ ...payload, previousInteractionId: id });
    },
  };
}
