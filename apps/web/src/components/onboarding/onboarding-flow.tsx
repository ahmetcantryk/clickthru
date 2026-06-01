'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { Select } from '@/components/ui/select';
import { completeOnboarding, isOnboarded, syncSession, type OnboardingProfile } from '@/lib/auth';

const GOALS = ['İnteraktif demolar', 'Ürün turları', 'Onboarding rehberleri', 'Satış demoları'];
const ROLES = ['Pazarlama', 'Satış', 'Ürün', 'Kurucu / Yönetici', 'Tasarım', 'Diğer'];
const SOURCES = ['Google', 'X / Twitter', 'LinkedIn', 'Bir arkadaş', 'Blog / haber', 'Diğer'];
const BRAND_COLORS = ['#2142E7', '#7C5CFC', '#0D9488', '#F97316', '#E0654E', '#1A1C24'];

const STEPS = [
  { key: 'profile', short: 'Profil oluştur' },
  { key: 'brand', short: 'Markanı ayarla' },
  { key: 'extension', short: 'Uzantıyı al' },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  const [goals, setGoals] = useState<string[]>(['İnteraktif demolar']);
  const [role, setRole] = useState('');
  const [source, setSource] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [brandColor, setBrandColor] = useState(BRAND_COLORS[0]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await syncSession();
      if (!alive) return;
      if (!u) {
        router.replace('/login');
        return;
      }
      if (isOnboarded()) {
        router.replace('/workspaces');
        return;
      }
      setWorkspace(`${u.name.split(' ')[0]}'in alanı`);
      setShow(true);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  function finish() {
    const profile: OnboardingProfile = { goals, role, source, workspace, brandColor };
    completeOnboarding(profile);
    router.push('/workspaces');
  }

  if (!show) return <div className="h-screen bg-canvas" />;

  return (
    <main className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      {/* top bar + stepper */}
      <header className="flex items-center gap-4 border-b border-hairline px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="oklch(var(--on-accent))" /></svg>
          </span>
          <span className="text-base font-bold tracking-tight">clickthru</span>
        </div>
        <div className="mx-auto flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                    i < step ? 'bg-accent text-accent-foreground' : i === step ? 'bg-accent text-accent-foreground' : 'border border-hairline-strong text-ink-faint',
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn('hidden text-[13px] font-semibold sm:inline', i === step ? 'text-ink' : 'text-ink-faint')}>{s.short}</span>
              </div>
              {i < STEPS.length - 1 && <span className="h-px w-7 bg-hairline" />}
            </div>
          ))}
        </div>
        <a href="mailto:destek@clickthru.app" className="hidden text-[13px] text-ink-faint hover:text-ink sm:inline">
          Yardım? <span className="font-semibold text-accent">İletişime geç</span>
        </a>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        {step === 0 && (
          <div className="w-full max-w-[520px]">
            <h1 className="text-4xl font-extrabold tracking-tight">Tanışalım.</h1>
            <p className="mt-3 text-[15px] text-ink-muted">Sana en uygun başlangıcı hazırlayalım.</p>

            <div className="mt-9 space-y-7">
              <Field label="Ne oluşturmayı planlıyorsun?">
                <div className="flex flex-wrap gap-2.5">
                  {GOALS.map((g) => {
                    const on = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoals((cur) => (on ? cur.filter((x) => x !== g) : [...cur, g]))}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors',
                          on ? 'border-accent bg-accent-muted text-ink' : 'border-hairline text-ink-muted hover:border-hairline-strong',
                        )}
                      >
                        <span className={cn('flex h-4 w-4 items-center justify-center rounded-md border', on ? 'border-accent bg-accent text-accent-foreground' : 'border-hairline-strong')}>
                          {on && <Check className="h-3 w-3" />}
                        </span>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Rolün nedir?">
                <Select value={role} onValueChange={setRole} placeholder="Bir seçenek seç…" options={ROLES.map((r) => ({ value: r, label: r }))} />
              </Field>
              <Field label="Bizi nereden duydun?">
                <Select value={source} onValueChange={setSource} placeholder="Bir seçenek seç…" options={SOURCES.map((s) => ({ value: s, label: s }))} />
              </Field>
            </div>

            <PrimaryBtn className="mt-9" onClick={() => setStep(1)} disabled={goals.length === 0}>
              Devam <ArrowRight className="h-4 w-4" />
            </PrimaryBtn>
          </div>
        )}

        {step === 1 && (
          <div className="w-full max-w-[520px]">
            <h1 className="text-4xl font-extrabold tracking-tight">Markanı ayarla.</h1>
            <p className="mt-3 text-[15px] text-ink-muted">Demoların ve paylaşım linkin bu kimliği taşıyacak.</p>

            <div className="mt-9 space-y-7">
              <Field label="Çalışma alanı adı">
                <input
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="h-12 w-full rounded-xl border border-hairline bg-surface px-4 text-[15px] text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring"
                />
              </Field>
              <Field label="Marka rengi">
                <div className="flex flex-wrap items-center gap-3">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBrandColor(c)}
                      aria-label={c}
                      className={cn('h-9 w-9 rounded-xl border border-black/10 transition-transform hover:scale-110', brandColor === c && 'ring-2 ring-offset-2 ring-offset-surface')}
                      style={{ background: c, boxShadow: brandColor === c ? `0 0 0 2px ${c}` : undefined }}
                    />
                  ))}
                </div>
              </Field>
              {/* preview chip */}
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-subtle p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: brandColor }}>
                  {workspace.trim().charAt(0).toUpperCase() || 'C'}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{workspace || 'Çalışma alanın'}</div>
                  <div className="text-xs text-ink-faint">clickthru.app/play/…</div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex items-center gap-3">
              <PrimaryBtn onClick={() => setStep(2)} disabled={!workspace.trim()}>
                Devam <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
              <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-ink-faint hover:text-ink">
                Şimdilik geç
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid w-full max-w-[980px] items-center gap-12 md:grid-cols-2">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Ücretsiz Chrome uzantısını al.</h1>
              <ul className="mt-7 space-y-3.5">
                {['Kaydı tek tıkla başlat — her tıklama bir adım olur', 'Demolarını 10× daha hızlı oluştur', 'Edge, Brave ve Opera ile de çalışır'].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-ink">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-accent-muted text-accent">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-start gap-3">
                <a
                  href="https://chromewebstore.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={finish}
                  className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-accent px-6 text-[15px] font-semibold text-accent-foreground shadow-glow hover:brightness-110"
                >
                  <ChromeIcon /> Uzantıyı yükle
                </a>
                <button type="button" onClick={finish} className="text-sm font-medium text-ink-faint hover:text-ink">
                  Şimdilik geç →
                </button>
              </div>
            </div>
            <ExtensionVisual color={brandColor} />
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, className }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-accent-foreground shadow-glow transition-all hover:brightness-110 disabled:opacity-40 disabled:shadow-none', className)}
    >
      {children}
    </button>
  );
}

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 6h7M9 6L5.5 3.2M6.4 10.5L2.6 13.8M11.6 10.5l1.8 4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ExtensionVisual({ color }: { color: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-b from-accent-muted to-transparent p-7">
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/samples/dashboard-1.svg" alt="" className="block aspect-video w-full object-cover" />
      </div>
      {/* capture pill */}
      <div className="absolute right-9 top-12 flex items-center gap-2 rounded-xl bg-ink/85 px-3 py-2 text-xs font-semibold text-white shadow-soft">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        Ekranını uzantıyla yakala
      </div>
    </div>
  );
}
