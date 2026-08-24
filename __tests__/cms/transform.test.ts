import { describe, it, expect } from 'vitest';
import { transform, pick } from '@/lib/cms/transform';
import { portfolioSchema } from '@/lib/cms/schema';
import fallback from '@/content/fallback.json';

const content = portfolioSchema.parse(fallback);

describe('transform', () => {
  const { messages, content: site } = transform(content);

  it('pt and en messages share the same top-level keys', () => {
    expect(Object.keys(messages.pt).sort()).toEqual(
      Object.keys(messages.en).sort(),
    );
  });

  it('flattens hero.role per language', () => {
    expect(messages.pt.hero.role).toBe(content.hero.role.pt);
    expect(messages.en.hero.role).toBe(content.hero.role.en);
  });

  it('localizes the complete V2 interface contract', () => {
    expect(messages.pt.v2.sections.experience.title).toBe(
      content.v2.sections.experience.title.pt,
    );
    expect(messages.en.v2.characterStudy.metaTitle).toBe(
      content.v2.characterStudy.metaTitle.en,
    );
  });

  it('exposes the postgraduate education in both languages', () => {
    expect(messages.pt.education.postgraduate).toEqual({
      degree: 'Pós-graduação em Engenharia de Software',
      school: 'PUC Minas',
      period: 'ago 2026 — fev 2028 · em andamento',
    });
    expect(messages.en.education.postgraduate).toEqual({
      degree: 'Postgraduate Specialization in Software Engineering',
      school: 'PUC Minas',
      period: 'Aug 2026 — Feb 2028 · in progress',
    });
  });

  it('publishes the updated English resume facts', () => {
    expect(messages.en.hero.role).toBe(
      'Software Developer | React | Next.js | TypeScript',
    );
    expect(messages.en.experience.roles[0]).toBe('Software Developer');
    expect(
      messages.en.experience.bullets[0]
        .map(({ head, text }) => `${head} ${text}`)
        .join(' '),
    ).toContain('development and maintenance of web applications');
    expect(site.experience[1].start).toBe('2023-03-01');
  });

  it('does not expose client company names in public resume content', () => {
    const publicResume = JSON.stringify({
      hero: messages.en.hero,
      experience: {
        pt: messages.pt.experience,
        en: messages.en.experience,
      },
    });

    for (const client of [
      'Natura',
      'Honda',
      'Boticário',
      'Jusbrasil',
      'Nubank',
      'Mobly',
    ]) {
      expect(publicResume).not.toContain(client);
    }
  });

  it('exposes section titles and projects.view', () => {
    expect(messages.pt.section.now).toBe(content.sections.now.pt);
    expect(messages.pt.section.courses).toBe(content.sections.courses.pt);
    expect(messages.pt.courses.items[0].title).toBe(
      content.courses[0].title.pt,
    );
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
