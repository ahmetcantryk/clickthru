/* landing-lower.jsx — export band · interactive showcase · comparison ·
   pricing · FAQ · closing CTA · footer */

function Ck() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>; }
function Dash() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 8h8" /></svg>; }

/* ---------------- export band (coming soon + waitlist) ---------------- */
function Waitlist() {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  return (
    <form className="ct-waitlist" onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }}>
      {done ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'oklch(0.78 0.16 145)', fontWeight: 600, fontSize: 15, padding: '12px 4px' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>
          Listeye eklendin — lansmanda ilk sen haberdar olacaksın.
        </div>
      ) : (
        <>
          <input type="email" required placeholder="çalışma e-postan" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="ct-btn ct-btn--primary" type="submit" style={{ flex: 'none' }}>Bekleme listesine gir</button>
        </>
      )}
    </form>
  );
}

function ExportBand() {
  const fmts = [['MP4', 'yüksek çözünürlük video'], ['GIF', 'döngüsel önizleme'], ['<embed/>', 'siteye gömülebilir']];
  return (
    <section className="ct-section" id="export">
      <div className="ct-wrap">
        <Reveal tag="div" className="ct-band">
          <div className="ct-band__wash" />
          <div className="ct-band__grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
              <span className="ct-pill ct-pill--soon">Yakında · Faz 2</span>
              <h2 className="ct-h2" style={{ color: '#fff' }}>Sunucu-taraflı export. Tarayıcıda değil, stüdyo kalitesinde.</h2>
              <p className="ct-body" style={{ color: 'oklch(0.78 0.01 264)' }}>
                Demolarını yüksek çözünürlüklü video, GIF veya HTML embed olarak dışa aktar. Sunucuda render edilir — zoom asla pikselleşmez. Henüz hazır değil; bekleme listesine gir, hazır olunca ilk sen dene.
              </p>
              <Waitlist />
            </div>
            <div className="ct-fmts" style={{ flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {fmts.map(([f, d]) => (
                  <div key={f} className="ct-fmt">
                    <div className="ct-fmt__ic">{f}</div>
                    <div className="ct-fmt__l">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- interactive showcase ---------------- */
function Showcase() {
  return (
    <section className="ct-section" id="showcase">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">CANLI ÖNİZLEME</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Sadece anlatmıyoruz — dene.</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>Gerçek player, gerçek adımlar. İleri/geri gez, zoom’u hisset, video adımını gör. İzleyenin göreceği deneyimin aynısı.</Reveal>
        </div>
        <Reveal style={{ maxWidth: 980, margin: '0 auto' }}>
          <LivePlayer steps={SHOWCASE_STEPS} auto={false} startPlaying={false} />
        </Reveal>
        <Reveal className="ct-center" delay={2} style={{ marginTop: 36 }}>
          <a className="ct-btn ct-btn--primary ct-btn--lg" href="#">
            Sen de böyle bir demo oluştur
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- comparison (anonymous) ---------------- */
function Comparison() {
  const cols = ['clickthru', 'Araç A', 'Araç B', 'Araç C'];
  const rows = [
    ['Pürüzsüz / sinematik zoom', 'yes', 'partial:kısmi', 'partial:sınırlı', 'partial:sınırlı'],
    ['Mixed-media (video + interaktif)', 'yes', 'yes', 'yes', 'partial:kısmi'],
    ['Yüksek kaliteli sunucu export', 'yes:yakında', 'yes', 'yes', 'partial:sınırlı'],
    ['Adil giriş fiyatı', 'yes', 'no', 'no', 'yes'],
  ];
  const cell = (v) => {
    const [kind, label] = v.split(':');
    if (kind === 'yes') return <span className="ct-yes"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px' }}><path d="M3 8.5l3 3 7-8" /></svg>{label ? ` ${label}` : ''}</span>;
    if (kind === 'partial') return <span className="ct-partial">{label}</span>;
    return <span className="ct-no">✕</span>;
  };
  return (
    <section className="ct-section">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">KONUM</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Farkımız nerede?</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>Diğer araçlara saygı duyuyoruz — farkımız zoom kalitesi ve adil fiyat.</Reveal>
        </div>
        <Reveal className="ct-cmp__wrap" style={{ maxWidth: 880, margin: '0 auto' }}>
          <table className="ct-cmp">
            <thead>
              <tr>
                <th></th>
                {cols.map((c, i) => <th key={c} className={i === 0 ? 'col-us' : ''}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  {r.slice(1).map((v, i) => <td key={i} className={i === 0 ? 'col-us' : ''}>{cell(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */
function PriceFeat({ children, off }) {
  return (
    <div className={`ct-price__feat ${off ? 'off' : ''}`}>
      {off ? <Dash /> : <Ck />}<span>{children}</span>
    </div>
  );
}
function Pricing() {
  return (
    <section className="ct-section" id="pricing">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">FİYATLANDIRMA</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Adil bir giriş, büyüdükçe esneyen plan</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>Ücretsiz başla, hazır olunca yükselt. İstediğin an iptal et.</Reveal>
        </div>
        <div className="ct-prices">
          <Reveal className="ct-price" delay={1}>
            <div className="ct-price__name">Free</div>
            <div className="ct-price__amt">₺0 <span className="per">/ sonsuza dek</span></div>
            <a className="ct-btn ct-btn--ghost ct-btn--block" href="#">Ücretsiz başla</a>
            <div className="ct-price__feats">
              <PriceFeat>3 demo</PriceFeat>
              <PriceFeat>Yakalama + Studio</PriceFeat>
              <PriceFeat>Pürüzsüz zoom & player</PriceFeat>
              <PriceFeat>Paylaşım linki (clickthru markalı)</PriceFeat>
              <PriceFeat off>Video / GIF / HTML export</PriceFeat>
              <PriceFeat off>Analitik & kişiselleştirme</PriceFeat>
            </div>
          </Reveal>

          <Reveal className="ct-price pop" delay={2}>
            <div className="ct-price__name">Pro</div>
            <div className="ct-price__amt">₺149 <span className="per">/ ay</span></div>
            <a className="ct-btn ct-btn--primary ct-btn--block" href="#">Pro’ya geç</a>
            <div className="ct-price__feats">
              <PriceFeat>Sınırsız demo</PriceFeat>
              <PriceFeat>Markasız paylaşım linki</PriceFeat>
              <PriceFeat>Pürüzsüz zoom & player</PriceFeat>
              <PriceFeat>Video / GIF / HTML export <span style={{ color: 'var(--warn)', fontWeight: 600, fontSize: 12 }}>(Faz 2)</span></PriceFeat>
              <PriceFeat>Temel analitik <span style={{ color: 'var(--warn)', fontWeight: 600, fontSize: 12 }}>(Faz 3)</span></PriceFeat>
              <PriceFeat off>Takım & CRM</PriceFeat>
            </div>
          </Reveal>

          <Reveal className="ct-price" delay={3}>
            <div className="ct-price__name">Team</div>
            <div className="ct-price__amt">₺99 <span className="per">/ kişi · ay</span></div>
            <a className="ct-btn ct-btn--ghost ct-btn--block" href="#">Satışla görüş</a>
            <div className="ct-price__feats">
              <PriceFeat>Pro’daki her şey</PriceFeat>
              <PriceFeat>Sınırsız demo & koltuk</PriceFeat>
              <PriceFeat>Markasız paylaşım linki</PriceFeat>
              <PriceFeat>Gelişmiş analitik <span style={{ color: 'var(--warn)', fontWeight: 600, fontSize: 12 }}>(Faz 3)</span></PriceFeat>
              <PriceFeat>Takım & CRM <span style={{ color: 'var(--warn)', fontWeight: 600, fontSize: 12 }}>(Faz 3)</span></PriceFeat>
              <PriceFeat>Öncelikli destek</PriceFeat>
            </div>
          </Reveal>
        </div>
        <Reveal className="ct-center" delay={1} style={{ marginTop: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>Yıllık ödemede 2 ay hediye · İstediğin an iptal · <em>Fiyatlar göstergeliktir, lansmanda netleşecek.</em></p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  return (
    <div className={`ct-faq__item ${open ? 'open' : ''}`}>
      <button className="ct-faq__q" onClick={() => setOpen((o) => !o)}>
        {q}
        <svg className="ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3.5v11M3.5 9h11" /></svg>
      </button>
      <div className="ct-faq__a" ref={ref} style={{ maxHeight: open ? (ref.current ? ref.current.scrollHeight : 200) : 0 }}>
        <div>{a}</div>
      </div>
    </div>
  );
}
function FAQ() {
  const items = [
    ['Kod bilmem gerekir mi?', 'Hayır. Yakalama, düzenleme ve paylaşım tamamen görsel — tek satır kod yazmadan demo oluşturursun.'],
    ['Verilerim nerede tutuluyor?', 'Demolar güvenli bir bulut veritabanı ve depolamada saklanır; hesabına bağlıdır. (Tam hesap sistemi Faz 3’te geliyor.)'],
    ['Hangi tarayıcıyı destekliyor?', 'Yakalama, modern bir Chrome uzantısı (MV3) ile çalışır. Oluşan demolar her modern tarayıcıda oynatılır.'],
    ['Video da kaydedebilir miyim?', 'Ekran görüntüsü akışı bugün hazır. Bir adımı video klibe çevirebilirsin; tam video yakalama yakında.'],
    ['Export ne zaman gelecek?', 'Video / GIF / HTML export Faz 2 kapsamında. Bekleme listesine girersen hazır olduğunda ilk sen denersin.'],
  ];
  return (
    <section className="ct-section" id="faq">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">SSS</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Sık sorulanlar</Reveal>
        </div>
        <Reveal className="ct-faq">
          {items.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- closing CTA ---------------- */
function ClosingCTA() {
  return (
    <section className="ct-close" id="roadmap">
      <div className="ct-wrap">
        <Reveal className="ct-close__inner">
          <h2 className="ct-h2" style={{ maxWidth: 620 }}>İlk demonu 60 saniyede oluştur.</h2>
          <p className="ct-lead" style={{ maxWidth: 480 }}>Kaydet, üstüne anlat, link olarak paylaş — en pürüzsüz zoom ve en temiz görünümle.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="ct-btn ct-btn--primary ct-btn--lg" href="#">
              Ücretsiz başla
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <a className="ct-btn ct-btn--ghost ct-btn--lg" href="#showcase">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 000-1l-7-4.8a.6.6 0 00-.9.5z" /></svg>
              Canlı demoyu izle
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
function Footer({ theme, setTheme }) {
  const cols = [
    ['Ürün', [['Özellikler', '#features'], ['Fiyatlandırma', '#pricing'], ['Yol haritası', '#roadmap']]],
    ['Kaynaklar', [['SSS', '#faq'], ['Dokümanlar', '#'], ['Değişiklikler', '#']]],
    ['Yasal', [['Gizlilik', '#'], ['Şartlar', '#'], ['İletişim', '#']]],
  ];
  return (
    <footer className="ct-footer">
      <div className="ct-wrap">
        <div className="ct-footer__grid">
          <div>
            <Logo />
            <p className="ct-footer__pitch">Ürününü kaydet, üstüne anlat, tıklanabilir demo olarak paylaş — en pürüzsüz zoom ve en temiz görünümle.</p>
          </div>
          {cols.map(([h, links]) => (
            <div key={h} className="ct-footer__col">
              <h4>{h}</h4>
              {links.map(([l, href]) => <a key={l} href={href}>{l}</a>)}
            </div>
          ))}
        </div>
        <div className="ct-footer__bottom">
          <span className="copy">© 2026 clickthru</span>
          <span style={{ flex: 1 }} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ExportBand, Showcase, Comparison, Pricing, FAQ, ClosingCTA, Footer });
