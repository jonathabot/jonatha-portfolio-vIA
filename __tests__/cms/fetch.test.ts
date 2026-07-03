import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fallback from '@/content/fallback.json';

const fallbackRolePt = (fallback as { hero: { role: { pt: string } } }).hero.role.pt;

describe('getContent', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns fallback when CMS_ENDPOINT_URL is unset', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', '');
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe(fallbackRolePt);
  });

  it('uses the endpoint response when it is valid', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    const custom = structuredClone(fallback) as typeof fallback;
    custom.hero.role.pt = 'CUSTOM ROLE';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(custom), { status: 200 })),
    );
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe('CUSTOM ROLE');
  });

  it('falls back when the endpoint returns 500', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    );
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe(fallbackRolePt);
  });

  it('falls back when the endpoint returns an invalid JSON shape', async () => {
    vi.stubEnv('CMS_ENDPOINT_URL', 'https://cms.example/exec');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ nope: true }), { status: 200 })),
    );
    const { getContent } = await import('@/lib/cms/fetch');
    const c = await getContent();
    expect(c.hero.role.pt).toBe(fallbackRolePt);
  });
});
