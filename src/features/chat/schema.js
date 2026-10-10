import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().transform((value) => value.trim()).refine((value) => {
    const length = Array.from(value).length;
    return length >= 1 && length <= 500;
  }),
  chatToken: z.string().min(1).max(4096),
  previous_interaction_id: z.string().min(1).max(1024).optional(),
}).strict();
