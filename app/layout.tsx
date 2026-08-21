import type { Metadata } from 'next';
import { Courier_Prime } from 'next/font/google';
import './globals.css';

const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-courier',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jonatha Mathews — Software Developer',
  description:
    'Software Developer with 3+ years of professional experience building web applications with React, Next.js, TypeScript and JavaScript.',
  authors: [{ name: 'Jonatha Mathews' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Jonatha Mathews — Software Developer',
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
        className={`${courier.variable} bg-bg text-ink`}
        style={{ fontFamily: 'var(--font-courier), monospace' }}
      >
        {children}
      </body>
    </html>
  );
}
