import type { Lang } from '@/lib/cms/types';

// Parse a YYYY-MM-DD string into a 0-based { y, m } without going through
// `new Date(str)`, which interprets the string as UTC midnight and can shift
// the month a day back in negative-offset timezones (e.g. UTC-3).
function parseISO(iso: string): { y: number; m: number } {
  const [y, m] = iso.split('-').map(Number);
  return { y, m: m - 1 };
}

export function calcDuration(
  startISO: string,
  endISO: string | null,
  lang: Lang,
  now: Date = new Date(),
): string {
  const s = parseISO(startISO);
  const e = endISO ? parseISO(endISO) : { y: now.getFullYear(), m: now.getMonth() };
  const months = (e.y - s.y) * 12 + (e.m - s.m) + 1; // inclusive, matching the prototype
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (lang === 'pt') {
    if (y > 0) parts.push(`${y} ${y > 1 ? 'anos' : 'ano'}`);
    if (m > 0) parts.push(`${m} ${m > 1 ? 'meses' : 'mês'}`);
    return parts.join(' e ');
  }
  if (y > 0) parts.push(`${y} ${y > 1 ? 'yrs' : 'yr'}`);
  if (m > 0) parts.push(`${m} ${m > 1 ? 'mos' : 'mo'}`);
  return parts.join(' ');
}
