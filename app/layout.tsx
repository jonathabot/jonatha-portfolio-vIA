import type { Metadata } from 'next';
import { Anton, DM_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { getContent } from '@/lib/cms/fetch';
import { pick } from '@/lib/cms/transform';
import './globals.css';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const title = pick(content.meta.title, 'en');
  return {
    title,
    description: pick(content.meta.description, 'en'),
    authors: [{ name: pick(content.v2.identity.name, 'en') }],
    icons: { icon: '/images/crown-name.png' },
    openGraph: {
      title,
      description: pick(content.meta.openGraphDescription, 'en'),
      type: 'website',
    },
  };
}

const themeScript = `(function(){try{var s=localStorage.getItem('jb-portfolio-ui');var t=s?JSON.parse(s).state.theme:null;if(t!=='dark'&&t!=='light')t='dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body
        className={`${mono.variable} ${display.variable} ${body.variable} bg-bg text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
