'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Chrome, Upload, X, Zap } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useT } from '@/lib/i18n';

/** "Yeni demo" akışı — workspaces üstünde bulanık katman (new-demo-screen.png). */
export function NewDemoModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { t } = useT();
  const [view, setView] = useState<'choose' | 'extension'>('choose');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button type="button" aria-label="close" onClick={onClose} className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-md" />
      <div className="relative w-full max-w-3xl">
        <button type="button" onClick={onClose} aria-label="close" className="absolute -top-2 right-0 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-subtle hover:text-ink">
          <X className="h-5 w-5" />
        </button>

        {view === 'choose' ? (
          <div className="animate-[fadein_.25s_ease]">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink">{t.newDemo.title}</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <ChoiceCard icon={<Upload className="h-7 w-7" strokeWidth={1.5} />} title={t.newDemo.scratchTitle} desc={t.newDemo.scratchDesc} onClick={() => router.push('/studio?new=1')} />
              <ChoiceCard icon={<Chrome className="h-7 w-7" strokeWidth={1.5} />} title={t.newDemo.extTitle} desc={t.newDemo.extDesc} badge={t.newDemo.popular} onClick={() => setView('extension')} />
            </div>
          </div>
        ) : (
          <div className="animate-[fadein_.25s_ease] overflow-hidden rounded-3xl border border-hairline bg-surface shadow-soft">
            <div className="grid md:grid-cols-2">
              <div className="p-9">
                <button type="button" onClick={() => setView('choose')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink">
                  <ArrowLeft className="h-4 w-4" /> {t.newDemo.back}
                </button>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.newDemo.extHeading}</h2>
                <ul className="mt-6 space-y-3">
                  {t.newDemo.extItems.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-accent-muted text-accent"><Check className="h-3.5 w-3.5" /></span>
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col items-start gap-3">
                  <a href="https://chromewebstore.google.com/" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-accent px-6 text-[15px] font-semibold text-accent-foreground shadow-glow hover:brightness-110">
                    <Chrome className="h-[18px] w-[18px]" /> {t.newDemo.installBtn}
                  </a>
                  <button type="button" onClick={() => router.push('/studio?new=1')} className="text-sm font-medium text-ink-faint hover:text-ink">{t.newDemo.already}</button>
                </div>
              </div>
              <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-b from-accent-muted to-transparent p-8 md:flex">
                <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/samples/dashboard-1.svg" alt="" className="block aspect-video w-full object-cover" style={{ width: 360 }} />
                </div>
                <div className="absolute right-12 top-16 flex items-center gap-2 rounded-xl bg-ink/85 px-3 py-2 text-xs font-semibold text-white shadow-soft">
                  <span className="h-2 w-2 rounded-full bg-accent" /> {t.newDemo.captureBadge}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceCard({ icon, title, desc, onClick, badge }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; badge?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('group relative flex flex-col items-center gap-4 rounded-3xl border bg-surface p-9 text-center transition-all hover:-translate-y-1 hover:shadow-soft', badge ? 'border-accent-ring' : 'border-hairline hover:border-hairline-strong')}>
      {badge && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <Zap className="h-3 w-3 fill-current" /> {badge}
        </span>
      )}
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-subtle text-ink transition-colors group-hover:bg-accent-muted group-hover:text-accent">{icon}</span>
      <div>
        <div className="text-lg font-bold text-ink">{title}</div>
        <div className="mx-auto mt-1.5 max-w-[220px] text-sm text-ink-muted">{desc}</div>
      </div>
    </button>
  );
}
