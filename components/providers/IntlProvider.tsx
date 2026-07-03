'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import type { Messages } from '@/lib/cms/transform';

export function IntlProvider({
  messages,
  children,
}: {
  messages: { pt: Messages; en: Messages };
  children: React.ReactNode;
}) {
  const lang = useUIStore((s) => s.lang);

  // Rehydrate the persisted store once, after mount (persist uses skipHydration).
  useEffect(() => {
    void useUIStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <NextIntlClientProvider locale={lang} messages={messages[lang]} timeZone="America/Sao_Paulo">
      {children}
    </NextIntlClientProvider>
  );
}
