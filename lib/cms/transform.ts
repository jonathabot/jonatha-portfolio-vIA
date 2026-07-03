import type { Lang, Loc, PortfolioContent } from './types';

export const pick = <T>(l: Loc<T>, lang: Lang): T => l[lang];

export type Messages = {
  meta: { nowUpdated: string; footer: string };
  nav: { tools: string; exp: string; projects: string; contact: string };
  section: {
    now: string;
    tools: string;
    exp: string;
    projects: string;
    education: string;
    contact: string;
  };
  hero: { hello: string; role: string; summary: string; cta: string };
  now: { items: string[] };
  tools: { names: string[]; items: string[] };
  experience: { roles: string[]; bullets: { head: string; text: string }[][] };
  projects: {
    titles: string[];
    dateLabels: string[];
    descs: string[];
    stacks: { k: string; v: string }[][];
    view: string;
  };
  education: {
    degree: string;
    school: string;
    degreeYear: string;
    langLine: string;
    langCert: string;
  };
  form: {
    name: string;
    email: string;
    message: string;
    send: string;
    cta: string;
    success: string;
    error: string;
  };
};

export type SiteContent = {
  flags: PortfolioContent['flags'];
  hero: { techs: string[]; links: PortfolioContent['hero']['links']; photoUrl: string | null };
  experience: { company: string; start: string; end: string | null; techs: string[] }[];
  projects: { imageUrl: string | null; repoUrl: string | null }[];
};

function messagesFor(c: PortfolioContent, lang: Lang): Messages {
  const p = <T>(l: Loc<T>) => pick(l, lang);
  return {
    meta: { nowUpdated: p(c.meta.nowUpdated), footer: p(c.meta.footer) },
    nav: {
      tools: p(c.nav.tools),
      exp: p(c.nav.exp),
      projects: p(c.nav.projects),
      contact: p(c.nav.contact),
    },
    section: {
      now: p(c.sections.now),
      tools: p(c.sections.tools),
      exp: p(c.sections.exp),
      projects: p(c.sections.projects),
      education: p(c.sections.education),
      contact: p(c.sections.contact),
    },
    hero: {
      hello: p(c.hero.hello),
      role: p(c.hero.role),
      summary: p(c.hero.summary),
      cta: p(c.hero.cta),
    },
    now: { items: c.now.items.map(p) },
    tools: { names: c.tools.map((t) => p(t.name)), items: c.tools.map((t) => p(t.items)) },
    experience: {
      roles: c.experience.map((e) => p(e.role)),
      bullets: c.experience.map((e) =>
        e.bullets.map((b) => ({ head: p(b.head), text: p(b.text) })),
      ),
    },
    projects: {
      titles: c.projects.map((x) => p(x.title)),
      dateLabels: c.projects.map((x) => p(x.dateLabel)),
      descs: c.projects.map((x) => p(x.desc)),
      stacks: c.projects.map((x) => x.stack.map((s) => ({ k: p(s.k), v: p(s.v) }))),
      view: p(c.projectsView),
    },
    education: {
      degree: p(c.education.degree),
      school: p(c.education.school),
      degreeYear: p(c.education.degreeYear),
      langLine: p(c.education.langLine),
      langCert: p(c.education.langCert),
    },
    form: {
      name: p(c.form.name),
      email: p(c.form.email),
      message: p(c.form.message),
      send: p(c.form.send),
      cta: p(c.form.cta),
      success: p(c.form.success),
      error: p(c.form.error),
    },
  };
}

export function transform(c: PortfolioContent): {
  messages: { pt: Messages; en: Messages };
  content: SiteContent;
} {
  return {
    messages: { pt: messagesFor(c, 'pt'), en: messagesFor(c, 'en') },
    content: {
      flags: c.flags,
      hero: { techs: c.hero.techs, links: c.hero.links, photoUrl: c.hero.photoUrl },
      experience: c.experience.map((e) => ({
        company: e.company,
        start: e.start,
        end: e.end,
        techs: e.techs,
      })),
      projects: c.projects.map((x) => ({ imageUrl: x.imageUrl, repoUrl: x.repoUrl })),
    },
  };
}
