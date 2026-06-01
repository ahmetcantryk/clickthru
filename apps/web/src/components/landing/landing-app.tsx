'use client';

import { useEffect, useState } from 'react';
import { LangProvider } from './i18n';
import {
  Nav,
  Hero,
  SocialProof,
  HowItWorks,
  Features,
  ExportBand,
  Showcase,
  Comparison,
  Pricing,
  FAQ,
  ClosingCTA,
  Footer,
} from './sections';

type Theme = 'light' | 'dark';

/**
 * Landing kabuğu. Tema yalnızca `.ct-site[data-theme]` üstünde (landing.css
 * token adası) — studio'nun global temasını ETKİLEMEZ. Dil TR/EN landing-only.
 */
export function LandingApp() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('clickthru-landing-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  function changeTheme(t: Theme) {
    setTheme(t);
    try {
      localStorage.setItem('clickthru-landing-theme', t);
    } catch {
      // yoksay
    }
  }

  return (
    <LangProvider>
      <div className="ct-site" data-theme={theme}>
        <Nav theme={theme} setTheme={changeTheme} />
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <ExportBand />
        <Showcase />
        <Comparison />
        <Pricing />
        <FAQ />
        <ClosingCTA />
        <Footer theme={theme} setTheme={changeTheme} />
      </div>
    </LangProvider>
  );
}
