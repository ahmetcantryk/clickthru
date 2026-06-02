import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppLangProvider } from '@/lib/i18n';

// Tasarım fontları (CLAUDE.md §6 revizyonu): gövde Hanken Grotesk, teknik/mono JetBrains Mono.
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'clickthru — studio',
  description: 'İnteraktif ürün demoları üreten studio.',
};

// Boyamadan önce data-theme uygula (FOUC yok). Varsayılan: light.
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('clickthru-theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      data-theme="light"
      suppressHydrationWarning
      className={`${hanken.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-ink">
        <AppLangProvider>{children}</AppLangProvider>
      </body>
    </html>
  );
}
