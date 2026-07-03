import { describe, it, expect } from 'vitest';
import { transform, pick } from '@/lib/cms/transform';
import { portfolioSchema } from '@/lib/cms/schema';
import fallback from '@/content/fallback.json';

const content = portfolioSchema.parse(fallback);

describe('transform', () => {
  const { messages, content: site } = transform(content);

  it('pt and en messages share the same top-level keys', () => {
    expect(Object.keys(messages.pt).sort()).toEqual(Object.keys(messages.en).sort());
  });

  it('flattens hero.role per language', () => {
    expect(messages.pt.hero.role).toBe(content.hero.role.pt);
    expect(messages.en.hero.role).toBe(content.hero.role.en);
  });

  it('exposes section titles and projects.view', () => {
    expect(messages.pt.section.now).toBe(content.sections.now.pt);
    expect(messages.en.projects.view).toBe(content.projectsView.en);
  });

  it('keeps language-neutral data in content', () => {
    expect(site.hero.techs).toEqual(content.hero.techs);
    expect(site.experience[0].start).toBe(content.experience[0].start);
    expect(site.projects[0].repoUrl).toBe(content.projects[0].repoUrl);
  });

  it('does not leak Loc objects into content', () => {
    expect(JSON.stringify(site)).not.toContain('"pt":');
  });

  it('pick selects the active language', () => {
    expect(pick({ pt: 'a', en: 'b' }, 'en')).toBe('b');
  });
});
