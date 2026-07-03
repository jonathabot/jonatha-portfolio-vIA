import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  message: z.string().min(1),
  website: z.string().max(0).optional().default(''),
  lang: z.enum(['pt', 'en']),
});

export type ContactInput = z.infer<typeof contactSchema>;
