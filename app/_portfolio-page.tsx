import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { PortfolioV2, type PortfolioScreen } from '@/components/v2/PortfolioV2';

export async function renderPortfolioPage(screen: PortfolioScreen) {
  const content = await getContent();
  const { messages, content: site } = transform(content);
  return (
    <IntlProvider messages={messages}>
      <PortfolioV2 site={site} screen={screen} />
    </IntlProvider>
  );
}
