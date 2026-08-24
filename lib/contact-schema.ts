import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  subject: z.string().max(160).optional(),
  message: z.string().min(1),
  website: z.string().max(0).optional(),
  lang: z.enum(['pt', 'en']),
});

export type ContactInput = z.infer<typeof contactSchema>;
