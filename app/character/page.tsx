import type { Metadata } from 'next';
import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { CharacterStudy } from '@/components/v2/CharacterStudy';

export const metadata: Metadata = {
  title: 'Character Study — Jonatha Botelho',
  description: 'Estudo interativo do personagem 3D de Jonatha Botelho.',
};

export default async function CharacterPage() {
  const content = await getContent();
  const { messages, content: site } = transform(content);
  return (
    <IntlProvider messages={messages}>
      <CharacterStudy site={site} />
    </IntlProvider>
  );
}
