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
  title: 'Jonatha Botelho — Desenvolvedor Google Cloud & Workspace',
  description:
    'Portfólio de Jonatha Botelho — Desenvolvedor Google Cloud & Google Workspace | Analista de Dados. Apps Script, AppSheet, BigQuery, Looker Studio, Cloud Run, React.',
  authors: [{ name: 'Jonatha Botelho' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Jonatha Botelho — Desenvolvedor Google Cloud & Workspace',
    description:
      'Automação de processos, dados e front-end. Apps Script, AppSheet, BigQuery, Looker Studio, Cloud Run, React.',
    type: 'website',
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('jb-portfolio-ui');var t=s?JSON.parse(s).state.theme:null;if(t!=='dark'&&t!=='light')t='light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
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
