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
  'w-full box-border border border-ink bg-bg px-[14px] py-3 text-[15px] text-ink outline-none';

export function Contact({ links }: { links: SiteContent['hero']['links'] }) {
  const t = useTranslations();
  const lang = useUIStore((s) => s.lang);
  const [status, setStatus] = useState<Status>('idle');
  const { register, handleSubmit, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '', website: '', lang },
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
      reset({ name: '', email: '', message: '', website: '', lang });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div id="contato" className="pt-11 pb-14">
      <SectionHeading>06 — {t('section.contact')}</SectionHeading>
      <p className="m-0 mb-7 text-[22px] font-bold">{t('form.cta')}</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-[480px] flex-col gap-3"
        noValidate
      >
        <input
          className={inputCls}
          placeholder={t('form.name')}
          {...register('name')}
        />
        <input
          className={inputCls}
          placeholder={t('form.email')}
          {...register('email')}
        />
        <textarea
          className={`${inputCls} resize-none`}
          rows={5}
          placeholder={t('form.message')}
          {...register('message')}
        />
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
          className="bg-ink text-bg self-start px-6 py-3 text-[14px] font-bold disabled:opacity-60"
        >
          {t('form.send')} →
        </button>
        {status === 'success' && (
          <span className="text-dim text-[13px]">{t('form.success')}</span>
        )}
        {status === 'error' && (
          <span className="text-faint text-[13px]">{t('form.error')}</span>
        )}
      </form>
      <div className="mt-8 flex flex-wrap gap-7 text-[14px]">
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
