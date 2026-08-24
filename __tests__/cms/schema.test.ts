import { describe, it, expect } from 'vitest';
import { portfolioSchema } from '@/lib/cms/schema';
import fallback from '@/content/fallback.json';

describe('portfolioSchema', () => {
  it('accepts the committed fallback.json', () => {
    expect(() => portfolioSchema.parse(fallback)).not.toThrow();
  });

  it('rejects a Loc field missing a language', () => {
    const bad = structuredClone(fallback) as Record<string, unknown> & {
      hero: { role: unknown };
    };
    bad.hero.role = { pt: 'só pt' };
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('rejects a non-ISO experience start date', () => {
    const bad = structuredClone(fallback) as Record<string, unknown> & {
      experience: { start: string }[];
    };
    bad.experience[0].start = 'ago 2024';
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('requires the complete V2 content contract', () => {
    const bad = structuredClone(fallback) as Record<string, unknown>;
    delete bad.v2;
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });
});
