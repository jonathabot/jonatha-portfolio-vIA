'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { contactSchema, type ContactInput } from '@/lib/contact-schema';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextLink } from '@/components/ui/TextLink';
import { LinkedInIcon } from '@/components/ui/icons/LinkedInIcon';
import { GitHubIcon } from '@/components/ui/icons/GitHubIcon';
import type { SiteContent } from '@/lib/cms/transform';

type Status = 'idle' | 'sending' | 'success' | 'error';
const inputCls =
  'w-full box-border border-2 border-ink bg-bg px-[14px] py-3 text-[13px] text-ink outline-none shadow-[4px_4px_0_var(--ink)] focus:shadow-[6px_6px_0_var(--ink)]';

export function Contact({
  links,
  embedded = false,
}: {
  links: SiteContent['hero']['links'];
  embedded?: boolean;
}) {
  const t = useTranslations();
  const lang = useUIStore((s) => s.lang);
  const [status, setStatus] = useState<Status>('idle');
  const { register, handleSubmit, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      website: '',
      lang,
    },
  });

  const onSubmit = async (data: ContactInput) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      reset({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '',
        lang,
      });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      id={embedded ? undefined : 'contato'}
      className={embedded ? '' : 'pt-11 pb-14'}
    >
      {!embedded && (
        <SectionHeading>06 — {t('section.contact')}</SectionHeading>
      )}
      {!embedded && (
        <p className="m-0 mb-7 text-[22px] font-bold">{t('form.cta')}</p>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`flex flex-col ${embedded ? 'max-w-none gap-4' : 'max-w-[480px] gap-3'}`}
        noValidate
      >
        <div className={embedded ? 'grid gap-5 md:grid-cols-2' : 'contents'}>
          <label className="text-faint flex flex-col gap-2 text-[8px] tracking-[.16em]">
            {embedded && 'NAME *'}
            <input
              className={inputCls}
              placeholder={embedded ? 'Your full name' : t('form.name')}
              {...register('name')}
            />
          </label>
          <label className="text-faint flex flex-col gap-2 text-[8px] tracking-[.16em]">
            {embedded && 'EMAIL *'}
            <input
              className={inputCls}
              placeholder={embedded ? 'you@email.com' : t('form.email')}
              {...register('email')}
            />
          </label>
        </div>
        {embedded && (
          <label className="text-faint flex flex-col gap-2 text-[8px] tracking-[.16em]">
            SUBJECT *
            <input
              className={inputCls}
              placeholder="Project inquiry, collaboration, open role..."
              {...register('subject')}
            />
          </label>
        )}
        <label className="text-faint flex flex-col gap-2 text-[8px] tracking-[.16em]">
          {embedded && 'MESSAGE *'}
          <textarea
            className={`${inputCls} resize-none`}
            rows={embedded ? 6 : 5}
            placeholder={
              embedded
                ? "Tell me about your project, timeline, and what you're looking for..."
                : t('form.message')
            }
            {...register('message')}
          />
        </label>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register('website')}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-ink text-yellow v2-shadow cursor-pointer self-start px-8 py-4 text-[12px] font-bold underline-offset-4 hover:underline disabled:opacity-60"
        >
          {embedded ? 'SEND TRANSMISSION ↗' : `${t('form.send')} →`}
        </button>
        {status === 'success' && (
          <span className="text-dim text-[13px]">{t('form.success')}</span>
        )}
        {status === 'error' && (
          <span className="text-faint text-[13px]">{t('form.error')}</span>
        )}
      </form>
      <div
        className={`mt-8 flex flex-wrap gap-7 text-[14px] ${embedded ? 'hidden' : ''}`}
      >
        <TextLink href={`mailto:${links.email}`}>{links.email}</TextLink>
        <TextLink
          href={links.linkedin}
          target="_blank"
          className="inline-flex items-center gap-[6px]"
        >
          <LinkedInIcon size={15} />
          /linkedin
        </TextLink>
        <TextLink
          href={links.github}
          target="_blank"
          className="inline-flex items-center gap-[6px]"
        >
          <GitHubIcon size={15} />
          /github
        </TextLink>
      </div>
    </div>
  );
}
