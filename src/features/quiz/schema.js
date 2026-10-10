import { z } from 'zod';

export const answersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number().int().positive(), optionId: z.number().int().positive(),
  }).strict()).length(20),
}).strict();
