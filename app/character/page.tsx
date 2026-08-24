import type { Metadata } from 'next';
import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { pick } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { CharacterStudy } from '@/components/v2/CharacterStudy';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: pick(content.v2.characterStudy.metaTitle, 'pt'),
    description: pick(content.v2.characterStudy.metaDescription, 'pt'),
  };
}

export default async function CharacterPage() {
  const content = await getContent();
  const { messages, content: site } = transform(content);
  return (
    <IntlProvider messages={messages}>
      <CharacterStudy site={site} />
    </IntlProvider>
  );
}
