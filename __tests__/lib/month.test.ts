import { describe, it, expect } from 'vitest';
import { formatMonthYear } from '@/lib/month';

describe('formatMonthYear', () => {
  it('PT abbreviates lowercase', () => {
    expect(formatMonthYear('2024-08-01', 'pt')).toBe('ago 2024');
    expect(formatMonthYear('2023-01-01', 'pt')).toBe('jan 2023');
  });
  it('EN abbreviates capitalized', () => {
    expect(formatMonthYear('2024-08-01', 'en')).toBe('Aug 2024');
    expect(formatMonthYear('2023-01-01', 'en')).toBe('Jan 2023');
  });
});
