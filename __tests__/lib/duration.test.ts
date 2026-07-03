import { describe, it, expect } from 'vitest';
import { calcDuration } from '@/lib/duration';

const NOW = new Date('2026-07-15');

describe('calcDuration', () => {
  // Inclusive month count, matching the prototype dur() (+1). Aug 2024 → Jul 2026 = 24 months.
  it('PT: whole years only', () => {
    expect(calcDuration('2024-08-01', null, 'pt', NOW)).toBe('2 anos');
  });
  it('EN: whole years only', () => {
    expect(calcDuration('2024-08-01', null, 'en', NOW)).toBe('2 yrs');
  });
  it('PT: months only', () => {
    expect(calcDuration('2026-05-01', '2026-07-01', 'pt', NOW)).toBe('3 meses');
  });
  it('PT: singular year and singular month', () => {
    expect(calcDuration('2023-01-01', '2024-01-01', 'pt', NOW)).toBe('1 ano e 1 mês');
  });
  it('fixed end date is honored (Mundo Móveis)', () => {
    expect(calcDuration('2023-01-01', '2024-08-01', 'pt', NOW)).toBe('1 ano e 8 meses');
  });
});
