import { portfolioSchema } from './schema';
import type { PortfolioContent } from './types';
import fallback from '@/content/fallback.json';

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function addCoursesDefaults(payload: unknown): unknown {
  if (!isObject(payload)) return payload;

  const nav = isObject(payload.nav)
    ? {
        ...payload.nav,
        education: Object.hasOwn(payload.nav, 'education')
          ? payload.nav.education
          : fallback.nav.education,
        courses: Object.hasOwn(payload.nav, 'courses')
          ? payload.nav.courses
          : fallback.nav.courses,
      }
    : payload.nav;

  const sections = isObject(payload.sections)
    ? {
        ...payload.sections,
        courses: Object.hasOwn(payload.sections, 'courses')
          ? payload.sections.courses
          : fallback.sections.courses,
      }
    : payload.sections;

  return {
    ...payload,
    nav,
    sections,
    courses: Object.hasOwn(payload, 'courses')
      ? payload.courses
      : fallback.courses,
  };
}

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
    return portfolioSchema.parse(addCoursesDefaults(await res.json()));
  } catch (err) {
    console.warn('[cms] using fallback.json:', (err as Error).message);
    return portfolioSchema.parse(fallback);
  }
}
