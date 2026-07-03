import { portfolioSchema } from './schema';
import type { PortfolioContent } from './types';
import fallback from '@/content/fallback.json';

export async function getContent(): Promise<PortfolioContent> {
  const base = process.env.CMS_ENDPOINT_URL;
  if (!base) return portfolioSchema.parse(fallback);

  try {
    const token = process.env.CMS_TOKEN;
    const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    return portfolioSchema.parse(await res.json());
  } catch (err) {
    console.warn('[cms] using fallback.json:', (err as Error).message);
    return portfolioSchema.parse(fallback);
  }
}
