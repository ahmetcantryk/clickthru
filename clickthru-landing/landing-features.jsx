/* landing-features.jsx — social proof · how it works · feature modules */

function Check() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M3 8.5l3 3 7-8" /></svg>; }

/* ---------------- social proof ---------------- */
function SocialProof() {
  const stats = [['60', 'sn', 'ilk demoya kadar'], ['100', '%', 'tarayıcıda çalışır'], ['0', '', 'satır kod']];
  return (
    <section className="ct-section ct-section--tight">
      <div className="ct-wrap">
        <Reveal className="ct-center" style={{ marginBottom: 40 }}>
          <div className="ct-h3" style={{ fontWeight: 700, color: 'var(--text)', maxWidth: 640, margin: '0 auto', lineHeight: 1.3 }}>
            Sinematik zoom kalitesi ve esnek format — tek araçta, adil fiyatla.
          </div>
        </Reveal>
        <div className="ct-stats">
          {stats.map(([n, u, l], i) => (
            <Reveal key={l} className="ct-stat" delay={i + 1}>
              <div className="ct-stat__n">{n}{u && <span className="u">{u}</span>}</div>
              <div className="ct-stat__l">{l}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Kaydet', body: 'Chrome uzantısını aç, kaydı başlat. Her tıklaman bir adım olur.', demo: <CaptureDemo />, fill: '33%' },
    { n: '02', title: 'Düzenle', body: 'Studio’da callout, hotspot, zoom ve metin ekle. Her şey sürükle-bırak.', demo: <StudioMiniDemo theme="dark" />, fill: '66%' },
    { n: '03', title: 'Paylaş', body: 'Tek tıkla link üret. İzleyen, tıklayarak ilerleyen bir tur görür.', demo: <ShareDemo />, fill: '100%' },
  ];
  return (
    <section className="ct-section" id="how">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">NASIL ÇALIŞIR</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Üç adımda canlı bir demo</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>Kaydından paylaşılabilir linke — arada ne kod var, ne karmaşık video editörü.</Reveal>
        </div>
        <div className="ct-steps">
          {steps.map((s, i) => (
            <Reveal key={s.n} className="ct-stepcard in" delay={i + 1} style={{ '--fill': s.fill }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="ct-stepcard__n">{s.n}</span>
                <span className="ct-h3" style={{ fontSize: 20 }}>{s.title}</span>
              </div>
              <p className="ct-body" style={{ margin: 0, minHeight: 46 }}>{s.body}</p>
              <div className="ct-stepcard__demo" style={{ height: 210 }}>{s.demo}</div>
              <div className="ct-stepcard__bar"><i /></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- feature module ---------------- */
function FeatureList({ items }) {
  return (
    <ul className="ct-feats" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li key={i} className={`ct-feat ${it.soon ? 'soon' : ''}`}>
          <span className="ct-feat__ck"><Check /></span>
          <span>{it.text}{it.soon && <span className="soontag">Yakında · Faz 2</span>}</span>
        </li>
      ))}
    </ul>
  );
}

function Module({ id, eyebrow, title, body, items, demo, flip, star }) {
  return (
    <div className={`ct-mod ${flip ? 'flip' : ''}`} id={id}>
      <Reveal className="ct-mod__copy" delay={flip ? 2 : 0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="ct-eyebrow">{eyebrow}</span>
          {star && <span className="ct-pill ct-pill--soft" style={{ padding: '4px 9px' }}>★ Baş farklılaşma</span>}
        </div>
        <h3 className="ct-h3" style={{ fontSize: 'clamp(23px,2.4vw,30px)', marginTop: 4 }}>{title}</h3>
        <p className="ct-body">{body}</p>
        <FeatureList items={items} />
      </Reveal>
      <Reveal className="ct-mod__demo" delay={flip ? 0 : 2}>{demo}</Reveal>
    </div>
  );
}

function Features() {
  return (
    <section className="ct-section" id="features">
      <div className="ct-wrap">
        <div className="ct-sechead">
          <Reveal className="ct-eyebrow">ÖZELLİKLER</Reveal>
          <Reveal tag="h2" className="ct-h2" delay={1}>Kayıttan paylaşıma kadar her şey tek yerde</Reveal>
          <Reveal tag="p" className="ct-lead" delay={2}>Yakalama, kamera, editör, mixed-media ve paylaşım — hepsi aynı pürüzsüz akışta.</Reveal>
        </div>

        <Module
          id="capture" eyebrow="YAKALAMA"
          title="Kaydı başlat, gerisini biz halledelim."
          body="Chrome uzantısı sayfana zarif bir overlay enjekte eder. Geri sayım biter, sen ürününü kullanırsın — her tıklama otomatik bir ekran görüntüsü ve hotspot’a dönüşür. Yakalama anında overlay kaybolur, ekran görüntüne girmez."
          items={[
            { text: '5-4-3-2-1 geri sayımla zarif başlangıç' },
            { text: '“Recording area” şeridi · Esc ile iptal · Ctrl+Y ile durdur' },
            { text: 'Her tıklama = oransal konumlu, hotspot’lu bir adım' },
            { text: 'Durdur → demo otomatik kurulur, Studio açılır' },
          ]}
          demo={<CaptureDemo />}
        />

        <Module
          id="camera" flip star eyebrow="KAMERA"
          title="Adım adım sınırlı değil — sinematik zoom."
          body="Her adıma bir focus dikdörtgeni çiz; player o bölgeye yumuşakça yakınlaşır. Aynı ekranda kalan adımlarda kamera kayar (pan), ekran değişince crossfade olur. Üç geçiş hızı: yumuşak, hızlı, yavaş."
          items={[
            { text: 'Köşeden boyutlandırılır, oran (örn. 1.8×) anlık gösterilir' },
            { text: 'Pan / zoom / crossfade otomatik seçilir' },
            { text: 'Export’ta asla pikselleşmez', soon: true },
          ]}
          demo={<CameraDemo />}
        />

        <Module
          id="studio" eyebrow="STUDIO"
          title="Bağlama duyarlı editör. Ne seçtiysen, onun ayarı."
          body="Sol panelde adımlar, ortada tuval, sağda akıllı inspector. Tuvale dört öğe koyarsın; her biri sürüklenir, hizalama kılavuzlarıyla piksel piksel oturur."
          items={[
            { text: '🎯 Hotspot — nabız atan tıklama noktası' },
            { text: '💬 Callout — başlık + açıklama, 4 yön ok, İleri/Geri' },
            { text: '🔤 Metin etiketi — serbest konum, S/M/L, renk' },
            { text: '🎬 Focus — kamera bölgesi (yumuşak/hızlı/yavaş)' },
          ]}
          demo={<StudioMiniDemo theme="dark" />}
        />

        <Module
          id="mixed" flip star eyebrow="KARIŞIK MEDYA"
          title="Ekran görüntüsü, video, interaktif adım — tek akıcı player."
          body="Bir adım statik screenshot, sonraki bir video klip, sonraki interaktif bir tur olabilir. İzleyici için hepsi tek pürüzsüz akış; geçişlerde otomatik crossfade."
          items={[
            { text: 'Screenshot adımı: tıkla → ilerle' },
            { text: 'Video adımı: oynat, bitince geç — progress kendi süresince dolar' },
            { text: 'Geçişlerde otomatik crossfade' },
          ]}
          demo={<ProgressDemo />}
        />

        <Module
          id="stage" eyebrow="SAHNE"
          title="Çıplak ekran görüntüsü değil — sahnelenmiş bir ürün."
          body="Demonu bir tarayıcı penceresi ya da sade koyu çerçeve içine al, veya çerçevesiz bırak. Arka planı hazır sahnelerden seç ya da kendi rengini ver. Soft shadow + dokulu zemin ile cilalı bir his."
          items={[
            { text: '3 wrapper: Browser · Koyu çerçeve · Yok' },
            { text: 'Hazır arka plan paleti + özel renk' },
            { text: 'Dark & light tema' },
          ]}
          demo={<StageDemo />}
        />

        <Module
          id="share" flip eyebrow="PAYLAŞIM"
          title="Tek link. Kurulum yok. Anında tıklanabilir tur."
          body="Paylaş’a bas, halka açık bir link al. İzleyen kişi koyu bir tiyatroda, yüzen cam kontrol dock’uyla adım adım ilerler — ileri/geri gider, istediği adıma atlar."
          items={[
            { text: 'play/{id} herkese açık link' },
            { text: 'Kopyala / yeni sekmede aç' },
            { text: 'Segment’li ilerleme, atlanabilir adımlar' },
          ]}
          demo={<ShareDemo />}
        />
      </div>
    </section>
  );
}

Object.assign(window, { SocialProof, HowItWorks, Features, Module, FeatureList });
