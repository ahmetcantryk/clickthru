/* landing-nav-hero.jsx — sticky navigation + hero with the live player */

function SunIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="9" r="3.4" /><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M14.4 3.6L13 5M5 13l-1.4 1.4" /></svg>; }
function MoonIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5A6 6 0 017.5 3a6 6 0 103 13.2 6 6 0 004.5-5.7z" /></svg>; }

function ThemeToggle({ theme, setTheme }) {
  return (
    <button className="ct-themetog" title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function Nav({ theme, setTheme }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['Özellikler', '#features'], ['Nasıl çalışır', '#how'], ['Fiyatlandırma', '#pricing'], ['Yol haritası', '#roadmap']];
  return (
    <nav className={`ct-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="ct-nav__inner">
        <a href="#top" style={{ textDecoration: 'none' }}><Logo /></a>
        <div className="ct-nav__links">
          {links.map(([l, h]) => <a key={l} className="ct-nav__link" href={h}>{l}</a>)}
        </div>
        <div className="ct-nav__right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a className="ct-btn ct-btn--ghost ct-btn--sm" href="#" title="Anonim modda Studio’ya gider">Giriş yap</a>
          <a className="ct-btn ct-btn--primary ct-btn--sm" href="#">Ücretsiz başla</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="ct-hero" id="top">
      <div className="ct-hero__wash" />
      <div className="ct-wrap">
        <div className="ct-hero__grid">
          <div className="ct-hero__copy">
            <Reveal className="ct-eyebrow">İNTERAKTİF ÜRÜN DEMOLARI</Reveal>
            <Reveal tag="h1" className="ct-h1" delay={1}>
              Ürün turlarını saniyeler içinde tıklanabilir demoya çevir.
            </Reveal>
            <Reveal tag="p" className="ct-lead" delay={2} style={{ maxWidth: 480 }}>
              Ekranını kaydet, üstüne callout ve zoom ekle, link olarak paylaş. Kod yok, video editörü yok — sadece pürüzsüz, paylaşılabilir bir ürün deneyimi.
            </Reveal>
            <Reveal className="ct-hero__cta" delay={3}>
              <a className="ct-btn ct-btn--primary ct-btn--lg" href="#">
                Ücretsiz başla
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </a>
              <a className="ct-btn ct-btn--ghost ct-btn--lg" href="#showcase">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 000-1l-7-4.8a.6.6 0 00-.9.5z" /></svg>
                Canlı demoyu izle
              </a>
            </Reveal>
            <Reveal className="ct-hero__trust" delay={4}>
              <span className="ct-dot" style={{ background: 'var(--good)' }} />Kredi kartı yok
              <span style={{ opacity: .4 }}>·</span>60 saniyede ilk demon
            </Reveal>
          </div>
          <Reveal className="ct-hero__demo" delay={2}>
            <LivePlayer steps={HERO_STEPS} auto />
          </Reveal>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Nav, Hero, ThemeToggle });
