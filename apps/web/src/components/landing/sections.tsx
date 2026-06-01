'use client';

import * as React from 'react';
import { Logo, Reveal, ThemeToggle, LangToggle } from './bits';
import { useLang } from './i18n';
import { LivePlayer, HERO_GEO, SHOWCASE_GEO } from './live-player';
import { CaptureDemo, CameraDemo, StudioMiniDemo, ProgressDemo, StageDemo, ShareDemo } from './demos';

type Theme = 'light' | 'dark';
type ThemeProps = { theme: Theme; setTheme: (t: Theme) => void };

const Arrow = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
const PlayIc = () => <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 000-1l-7-4.8a.6.6 0 00-.9.5z" /></svg>;
const Check = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M3 8.5l3 3 7-8" /></svg>;

/* ============ NAV ============ */
export function Nav({ theme, setTheme }: ThemeProps) {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links: [string, string][] = [
    [t.nav.features, '#features'],
    [t.nav.how, '#how'],
    [t.nav.pricing, '#pricing'],
    [t.nav.faq, '#faq'],
  ];
  return (
    <nav className={`ct-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="ct-nav__inner">
        <a href="#top" style={{ textDecoration: 'none' }}><Logo /></a>
        <div className="ct-nav__links">
          {links.map(([l, h]) => <a key={h} className="ct-nav__link" href={h}>{l}</a>)}
        </div>
        <div className="ct-nav__right">
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <a className="ct-btn ct-btn--ghost ct-btn--sm ct-nav__hideSm" href="/studio">{t.nav.login}</a>
          <a className="ct-btn ct-btn--primary ct-btn--sm" href="/studio">{t.nav.start}</a>
        </div>
      </div>
    </nav>
  );
}

/* ============ HERO ============ */
export function Hero() {
  const { t } = useLang();
  return (
    <header className="ct-hero" id="top">
      <div className="ct-hero__wash" />
      <div className="ct-wrap">
        <div className="ct-hero__grid">
          <div className="ct-hero__copy">
            <Reveal className="ct-eyebrow">{t.hero.eyebrow}</Reveal>
            <Reveal tag="h1" className="ct-h1" delay={1}>{t.hero.title}</Reveal>
            <Reveal tag="p" className="ct-lead" delay={2} style={{ maxWidth: 480 }}>{t.hero.lead}</Reveal>
            <Reveal className="ct-hero__cta" delay={3}>
              <a className="ct-btn ct-btn--primary ct-btn--lg" href="/studio">{t.hero.ctaPrimary}<Arrow /></a>
              <a className="ct-btn ct-btn--ghost ct-btn--lg" href="#showcase"><PlayIc />{t.hero.ctaSecondary}</a>
            </Reveal>
            <Reveal className="ct-hero__trust" delay={4}>
              <span className="ct-dot" style={{ color: 'var(--good)' }} />{t.hero.trust1}
              <span style={{ opacity: 0.4 }}>·</span>{t.hero.trust2}
            </Reveal>
          </div>
          <Reveal className="" delay={2}>
            <LivePlayer geo={HERO_GEO} copy={t.heroSteps} auto tag={t.player.auto} />
          </Reveal>
        </div>
      </div>
    </header>
  );
}

/* ============ SOCIAL PROOF ============ */
export function SocialProof() {
  const { t } = useLang();
  return (
    <section className="ct-section ct-section--tight">
      <div className="ct-wrap">
        <Reveal className="ct-center" style={{ marginBottom: 40 }}>
          <div className="ct-h3" style={{ fontWeight: 700, color: 'var(--text)', maxWidth: 640, margin: '0 auto', lineHeight: 1.3 }}>{t.proof.headline}</div>
        </Reveal>
        <div className="ct-stats">
          {t.proof.stats.map((s, i) => (
            <Reveal key={s.l} className="ct-stat" delay={(i + 1) as 1 | 2 | 3}>
              <div className="ct-stat__n">{s.n}{s.u && <span className="u">{s.u}</span>}</div>
              <div className="ct-stat__l">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ HOW IT WORKS ============ */
export function HowItWorks() {
  const { t } = useLang();
  const demos = [<CaptureDemo key="c" />, <StudioMiniDemo key="s" />, <ShareDemo key="sh" />];
  const fills = ['33%', '66%', '100%'];
  return (
    <section className="ct-section" id="how">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{t.how.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{t.how.title}</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>{t.how.lead}</Reveal>
        </div>
        <div className="ct-steps">
          {t.how.steps.map((s, i) => (
            <Reveal key={s.n} className="ct-stepcard in" delay={(i + 1) as 1 | 2 | 3} style={{ '--fill': fills[i] } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="ct-stepcard__n">{s.n}</span>
                <span className="ct-h3" style={{ fontSize: 20 }}>{s.title}</span>
              </div>
              <p className="ct-body" style={{ minHeight: 46 }}>{s.body}</p>
              <div className="ct-stepcard__demo" style={{ padding: 14 }}>{demos[i]}</div>
              <div className="ct-stepcard__bar"><i /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FEATURES ============ */
function Module({ id, eyebrow, title, body, items, demo, flip, star }: { id: string; eyebrow: string; title: string; body: string; items: string[]; demo: React.ReactNode; flip?: boolean; star?: boolean }) {
  const { t } = useLang();
  return (
    <div className={`ct-mod ${flip ? 'flip' : ''}`} id={id}>
      <Reveal className="ct-mod__copy" delay={flip ? 2 : 0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="ct-eyebrow">{eyebrow}</span>
          {star && <span className="ct-pill ct-pill--soft">{t.features.star}</span>}
        </div>
        <h3 className="ct-h3" style={{ fontSize: 'clamp(23px,2.4vw,30px)', marginTop: 4 }}>{title}</h3>
        <p className="ct-body">{body}</p>
        <ul className="ct-feats">
          {items.map((it, i) => (
            <li key={i} className="ct-feat"><span className="ct-feat__ck"><Check /></span><span>{it}</span></li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="ct-mod__demo" delay={flip ? 0 : 2}>{demo}</Reveal>
    </div>
  );
}

export function Features() {
  const { t } = useLang();
  const f = t.features;
  return (
    <section className="ct-section" id="features">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{f.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{f.title}</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>{f.lead}</Reveal>
        </div>
        <Module id="capture" eyebrow={f.capture.eyebrow} title={f.capture.title} body={f.capture.body} items={f.capture.items} demo={<CaptureDemo />} />
        <Module id="camera" flip star eyebrow={f.camera.eyebrow} title={f.camera.title} body={f.camera.body} items={f.camera.items} demo={<CameraDemo />} />
        <Module id="studio" eyebrow={f.studio.eyebrow} title={f.studio.title} body={f.studio.body} items={f.studio.items} demo={<StudioMiniDemo />} />
        <Module id="mixed" flip star eyebrow={f.mixed.eyebrow} title={f.mixed.title} body={f.mixed.body} items={f.mixed.items} demo={<ProgressDemo />} />
        <Module id="stage" eyebrow={f.stage.eyebrow} title={f.stage.title} body={f.stage.body} items={f.stage.items} demo={<StageDemo />} />
        <Module id="share" flip eyebrow={f.share.eyebrow} title={f.share.title} body={f.share.body} items={f.share.items} demo={<ShareDemo />} />
      </div>
    </section>
  );
}

/* ============ EXPORT BAND ============ */
export function ExportBand() {
  const { t } = useLang();
  const e = t.exportBand;
  return (
    <section className="ct-section" id="export">
      <div className="ct-wrap">
        <Reveal className="ct-band">
          <div className="ct-band__wash" />
          <div className="ct-band__grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
              <span className="ct-eyebrow" style={{ color: 'oklch(0.78 0.15 256)' }}>{e.eyebrow}</span>
              <h2 className="ct-h2" style={{ color: '#fff' }}>{e.title}</h2>
              <p className="ct-body" style={{ color: 'oklch(0.8 0.01 264)' }}>{e.body}</p>
              <a className="ct-btn ct-btn--primary" href="/studio">{e.cta}<Arrow /></a>
            </div>
            <div className="ct-fmts">
              {e.fmts.map((m) => (
                <div key={m.ic} className="ct-fmt"><div className="ct-fmt__ic">{m.ic}</div><div className="ct-fmt__l">{m.l}</div></div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ SHOWCASE (try it — no nested black) ============ */
export function Showcase() {
  const { t } = useLang();
  return (
    <section className="ct-section" id="showcase">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{t.showcase.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{t.showcase.title}</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>{t.showcase.lead}</Reveal>
        </div>
        <Reveal style={{ maxWidth: 980, margin: '0 auto' }}>
          <LivePlayer geo={SHOWCASE_GEO} copy={t.showcaseSteps} auto={false} startPlaying={false} tag={t.player.interactive} />
        </Reveal>
        <Reveal className="ct-center" delay={2} style={{ marginTop: 36 }}>
          <a className="ct-btn ct-btn--primary ct-btn--lg" href="/studio">{t.showcase.cta}<Arrow /></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ COMPARISON ============ */
export function Comparison() {
  const { t } = useLang();
  const c = t.comparison;
  const cell = (v: string) => {
    const [kind, label] = v.split(':');
    if (kind === 'yes') return <span className="ct-yes"><Check />{label ? ` ${label}` : ''}</span>;
    if (kind === 'partial') return <span className="ct-partial">{label}</span>;
    return <span className="ct-no">✕</span>;
  };
  return (
    <section className="ct-section">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{c.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{c.title}</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>{c.lead}</Reveal>
        </div>
        <Reveal style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="ct-cmp__wrap">
            <table className="ct-cmp">
              <thead>
                <tr>
                  <th></th>
                  {c.cols.map((col, i) => <th key={col} className={i === 0 ? 'col-us' : ''}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td className="col-us">{cell(r.us)}</td>
                    <td>{cell(r.a)}</td>
                    <td>{cell(r.b)}</td>
                    <td>{cell(r.c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ PRICING ============ */
export function Pricing() {
  const { t } = useLang();
  const p = t.pricing;
  return (
    <section className="ct-section" id="pricing">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{p.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{p.title}</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>{p.lead}</Reveal>
        </div>
        <div className="ct-prices">
          {p.plans.map((plan, i) => (
            <Reveal key={plan.name} className={`ct-price ${plan.pop ? 'pop' : ''}`} delay={(i + 1) as 1 | 2 | 3}>
              {plan.pop && <span className="ct-price__badge">{p.badge}</span>}
              <div className="ct-price__name">{plan.name}</div>
              <div className="ct-price__amt">{plan.price} <span className="per">{plan.per}</span></div>
              <a className={`ct-btn ${plan.pop ? 'ct-btn--primary' : 'ct-btn--ghost'} ct-btn--block`} href="/studio">{plan.cta}</a>
              <div className="ct-price__feats">
                {plan.feats.map((ft, k) => (
                  <div key={k} className={`ct-price__feat ${ft.off ? 'off' : ''}`}>
                    {ft.off ? (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 8h8" /></svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>
                    )}
                    <span>{ft.t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="ct-center" delay={1} style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{p.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ FAQ ============ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div className={`ct-faq__item ${open ? 'open' : ''}`}>
      <button className="ct-faq__q" onClick={() => setOpen((o) => !o)}>
        {q}
        <svg className="ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3.5v11M3.5 9h11" /></svg>
      </button>
      <div className="ct-faq__a" ref={ref} style={{ maxHeight: open ? ref.current?.scrollHeight ?? 200 : 0 }}>
        <div>{a}</div>
      </div>
    </div>
  );
}
export function FAQ() {
  const { t } = useLang();
  return (
    <section className="ct-section" id="faq">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">{t.faq.eyebrow}</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>{t.faq.title}</Reveal>
        </div>
        <Reveal className="ct-faq">
          {t.faq.items.map((it) => <FaqItem key={it.q} q={it.q} a={it.a} />)}
        </Reveal>
      </div>
    </section>
  );
}

/* ============ CLOSING ============ */
export function ClosingCTA() {
  const { t } = useLang();
  return (
    <section className="ct-close">
      <div className="ct-wrap">
        <Reveal className="ct-close__inner">
          <h2 className="ct-h2" style={{ maxWidth: 620 }}>{t.closing.title}</h2>
          <p className="ct-lead" style={{ maxWidth: 480 }}>{t.closing.lead}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="ct-btn ct-btn--primary ct-btn--lg" href="/studio">{t.closing.ctaPrimary}<Arrow /></a>
            <a className="ct-btn ct-btn--ghost ct-btn--lg" href="#showcase"><PlayIc />{t.closing.ctaSecondary}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ FOOTER ============ */
export function Footer({ theme, setTheme }: ThemeProps) {
  const { t, lang, setLang } = useLang();
  return (
    <footer className="ct-footer">
      <div className="ct-wrap">
        <div className="ct-footer__grid">
          <div>
            <Logo />
            <p className="ct-footer__pitch">{t.footer.pitch}</p>
          </div>
          {t.footer.cols.map((col) => (
            <div key={col.h} className="ct-footer__col">
              <h4>{col.h}</h4>
              {col.links.map((lnk) => <a key={lnk[0]} href={lnk[1]}>{lnk[0]}</a>)}
            </div>
          ))}
        </div>
        <div className="ct-footer__bottom">
          <span className="copy">{t.footer.copy}</span>
          <span style={{ flex: 1 }} />
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </footer>
  );
}
