import type { Metadata } from 'next';
import { Anton, DM_Sans, JetBrains_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Jonatha Botelho — Software Developer',
  description:
    'Software Developer with 3+ years of professional experience building web applications with React, Next.js, TypeScript and JavaScript.',
  authors: [{ name: 'Jonatha Botelho' }],
  icons: { icon: '/images/crown-name.png' },
  openGraph: {
    title: 'Jonatha Botelho — Software Developer',
    description:
      'Frontend development, responsive interfaces, REST API integrations, Google Cloud and Google Workspace.',
    type: 'website',
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('jb-portfolio-ui');var t=s?JSON.parse(s).state.theme:null;if(t!=='dark'&&t!=='light')t='dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${mono.variable} ${display.variable} ${body.variable} bg-bg text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
