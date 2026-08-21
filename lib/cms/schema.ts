import { z } from 'zod';

export const loc = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ pt: inner, en: inner });

const locStr = loc(z.string());
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const portfolioSchema = z.object({
  meta: z.object({ nowUpdated: locStr, footer: locStr }),
  flags: z.object({ showEducation: z.boolean(), showPhoto: z.boolean() }),
  nav: z.object({
    tools: locStr,
    exp: locStr,
    education: locStr,
    courses: locStr,
    projects: locStr,
    contact: locStr,
  }),
  sections: z.object({
    now: locStr,
    tools: locStr,
    exp: locStr,
    education: locStr,
    courses: locStr,
    projects: locStr,
    contact: locStr,
  }),
  hero: z.object({
    hello: locStr,
    role: locStr,
    summary: locStr,
    cta: locStr,
    techs: z.array(z.string()),
    links: z.object({
      email: z.string(),
      linkedin: z.string(),
      github: z.string(),
    }),
    photoUrl: z.string().nullable(),
  }),
  now: z.object({ items: z.array(locStr) }),
  tools: z.array(z.object({ name: locStr, items: locStr })),
  experience: z.array(
    z.object({
      company: z.string(),
      start: isoDate,
      end: isoDate.nullable(),
      role: locStr,
      techs: z.array(z.string()),
      bullets: z.array(z.object({ head: locStr, text: locStr })),
    }),
  ),
  projects: z.array(
    z.object({
      imageUrl: z.string().nullable(),
      repoUrl: z.string().nullable(),
      title: locStr,
      dateLabel: locStr,
      desc: locStr,
      stack: z.array(z.object({ k: locStr, v: locStr })),
    }),
  ),
  projectsView: locStr,
  education: z.object({
    degree: locStr,
    school: locStr,
    degreeYear: locStr,
    langLine: locStr,
    langCert: locStr,
  }),
  courses: z.array(
    z.object({
      title: locStr,
      issuer: locStr,
      year: z.string(),
      details: locStr.nullable(),
    }),
  ),
  form: z.object({
    name: locStr,
    email: locStr,
    message: locStr,
    send: locStr,
    cta: locStr,
    success: locStr,
    error: locStr,
  }),
});
