import { notFound } from 'next/navigation';
import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { ProjectDetail } from '@/components/v2/ProjectDetail';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = Number(slug) - 1;
  const content = await getContent();
  const { messages, content: site } = transform(content);
  if (!Number.isInteger(index) || index < 0 || index >= 4) notFound();
  return (
    <IntlProvider messages={messages}>
      <ProjectDetail site={site} index={index} />
    </IntlProvider>
  );
}
