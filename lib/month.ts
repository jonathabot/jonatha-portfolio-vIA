import type { Lang } from '@/lib/cms/types';

const PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonthYear(iso: string, lang: Lang): string {
  const [y, m] = iso.split('-').map(Number);
  const table = lang === 'pt' ? PT : EN;
  return `${table[m - 1]} ${y}`;
}
