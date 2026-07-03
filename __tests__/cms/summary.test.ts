import { describe, it, expect } from 'vitest';
import { parseSummary } from '@/lib/cms/summary';

describe('parseSummary', () => {
  it('returns a single normal segment when there are no markers', () => {
    expect(parseSummary('plain text')).toEqual([{ text: 'plain text', highlight: false }]);
  });

  it('splits three [[...]] markers into alternating segments in order', () => {
    const out = parseSummary('a [[X]] b [[Y]] c [[Z]] d');
    expect(out).toEqual([
      { text: 'a ', highlight: false },
      { text: 'X', highlight: true },
      { text: ' b ', highlight: false },
      { text: 'Y', highlight: true },
      { text: ' c ', highlight: false },
      { text: 'Z', highlight: true },
      { text: ' d', highlight: false },
    ]);
  });

  it('drops empty leading/trailing normal segments', () => {
    expect(parseSummary('[[X]]')).toEqual([{ text: 'X', highlight: true }]);
  });
});
