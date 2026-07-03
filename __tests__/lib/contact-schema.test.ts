import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/contact-schema';

const base = { name: 'Ana', email: 'ana@example.com', message: 'oi', website: '', lang: 'pt' };

describe('contactSchema', () => {
  it('accepts a valid submission', () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });
  it('rejects empty name', () => {
    expect(contactSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
  it('rejects malformed email', () => {
    expect(contactSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
  });
  it('rejects empty message', () => {
    expect(contactSchema.safeParse({ ...base, message: '' }).success).toBe(false);
  });
  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...base, website: 'bot' }).success).toBe(false);
  });
});
