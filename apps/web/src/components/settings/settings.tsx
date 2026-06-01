'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CreditCard, Palette, ShieldAlert, User } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { getProfile, getSession, initials, signOut, updateProfile, updateSession } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { AppLayout } from '@/components/app/app-layout';
import { Select } from '@/components/ui/select';

export function SettingsApp() {
  return (
    <AppLayout active="settings">
      <Settings />
    </AppLayout>
  );
}

type Tab = 'profile' | 'account' | 'appearance' | 'plan' | 'notifications';
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profil', icon: <User className="h-4 w-4" /> },
  { key: 'account', label: 'Hesap', icon: <ShieldAlert className="h-4 w-4" /> },
  { key: 'appearance', label: 'Görünüm', icon: <Palette className="h-4 w-4" /> },
  { key: 'plan', label: 'Plan', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'notifications', label: 'Bildirimler', icon: <Bell className="h-4 w-4" /> },
];
const ROLES = ['Pazarlama', 'Satış', 'Ürün', 'Kurucu / Yönetici', 'Tasarım', 'Diğer'];
const BRAND_COLORS = ['#2142E7', '#7C5CFC', '#0D9488', '#F97316', '#E0654E', '#1A1C24'];

function Settings() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && TABS.some((x) => x.key === t)) setTab(t as Tab);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-8 py-9">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Hesap ayarları</h1>
      <p className="mt-1 text-[14px] text-ink-faint">Profilini, çalışma alanını ve tercihlerini yönet.</p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-hairline">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors',
              tab === t.key ? 'border-accent text-ink' : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'account' && <AccountTab onSignOut={() => { signOut(); router.replace('/login'); }} />}
        {tab === 'appearance' && <AppearanceTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */
function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-6">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      {desc && <p className="mt-1 text-[13px] text-ink-faint">{desc}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-ink">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-xl border border-hairline bg-surface px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent-ring focus:ring-2 focus:ring-accent-ring disabled:bg-surface-subtle disabled:text-ink-faint',
        props.className,
      )}
    />
  );
}
function SaveBar({ onSave }: { onSave: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => {
          onSave();
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors',
          done ? 'bg-success-soft text-success' : 'bg-accent text-accent-foreground shadow-glow hover:brightness-110',
        )}
      >
        {done ? <><Check className="h-4 w-4" /> Kaydedildi</> : 'Değişiklikleri kaydet'}
      </button>
    </div>
  );
}
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 flex-none rounded-full transition-colors', checked ? 'bg-accent' : 'bg-hairline-strong')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

/* ---------- tabs ---------- */
function ProfileTab() {
  const user = getSession();
  const profile = getProfile();
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState(profile?.role ?? '');
  const brandColor = profile?.brandColor || '#2142E7';

  return (
    <Card title="Profil" desc="Bu bilgiler çalışma alanında ve paylaşımlarında görünebilir.">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: brandColor }}>
          {name ? initials(name) : '–'}
        </span>
        <button type="button" className="rounded-xl border border-hairline px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-surface-subtle">
          Fotoğraf yükle
        </button>
      </div>
      <Field label="Ad Soyad">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="E-posta" hint="E-posta Google hesabına bağlı; buradan değiştirilemez.">
        <Input value={user?.email ?? ''} disabled />
      </Field>
      <Field label="Rol">
        <Select value={role} onValueChange={setRole} placeholder="Bir rol seç…" options={ROLES.map((r) => ({ value: r, label: r }))} />
      </Field>
      <SaveBar onSave={() => { updateSession({ name }); updateProfile({ role }); }} />
    </Card>
  );
}

function AccountTab({ onSignOut }: { onSignOut: () => void }) {
  const profile = getProfile();
  const user = getSession();
  const [workspace, setWorkspace] = useState(profile?.workspace ?? '');
  const [brandColor, setBrandColor] = useState(profile?.brandColor || '#2142E7');

  return (
    <div className="space-y-5">
      <Card title="Çalışma alanı" desc="Demolarının ve paylaşım linkinin kimliği.">
        <Field label="Çalışma alanı adı">
          <Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} />
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
        <SaveBar onSave={() => updateProfile({ workspace, brandColor })} />
      </Card>

      <Card title="Oturum">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[13.5px] text-ink-muted">
            <span className="font-semibold text-ink">{user?.email}</span> ile giriş yapıldı.
          </div>
          <button type="button" onClick={onSignOut} className="rounded-xl border border-hairline px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-surface-subtle">
            Çıkış yap
          </button>
        </div>
      </Card>

      <section className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-danger"><ShieldAlert className="h-4 w-4" /> Tehlikeli bölge</h2>
        <p className="mt-1 text-[13px] text-ink-muted">Hesabını silersen tüm demoların ve verilerin kalıcı olarak kaldırılır.</p>
        <button type="button" onClick={onSignOut} className="mt-4 rounded-xl border border-danger/40 bg-surface px-3.5 py-2 text-[13px] font-semibold text-danger hover:bg-danger-soft">
          Hesabı sil
        </button>
      </section>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <Card title="Görünüm" desc="Uygulamanın temasını seç.">
      <Field label="Tema">
        <div className="grid max-w-sm grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={cn('rounded-2xl border p-3 text-left transition-colors', theme === t ? 'border-accent ring-2 ring-accent-ring' : 'border-hairline hover:border-hairline-strong')}
            >
              <span className={cn('block h-16 w-full rounded-lg border', t === 'dark' ? 'border-white/10 bg-[#16181f]' : 'border-black/5 bg-[#f4f5f8]')}>
                <span className="m-2 block h-2 w-10 rounded-full" style={{ background: t === 'dark' ? '#3b4252' : '#d9dde6' }} />
                <span className="mx-2 block h-2 w-16 rounded-full" style={{ background: t === 'dark' ? '#2a2f3a' : '#e7eaf0' }} />
              </span>
              <span className="mt-2 block text-[13px] font-semibold text-ink">{t === 'dark' ? 'Koyu' : 'Açık'}</span>
            </button>
          ))}
        </div>
      </Field>
    </Card>
  );
}

function PlanTab() {
  const plans = [
    { name: 'Free', price: '₺0', per: '/ sonsuza dek', current: true, feats: ['3 demo', 'Yakalama + Studio', 'clickthru markalı link'] },
    { name: 'Pro', price: '₺149', per: '/ ay', pop: true, feats: ['Sınırsız demo', 'Markasız link', 'Video / GIF / HTML export'] },
    { name: 'Team', price: '₺99', per: '/ kişi · ay', feats: ['Pro’daki her şey', 'Ekip & CRM', 'Öncelikli destek'] },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {plans.map((p) => (
        <div key={p.name} className={cn('relative flex flex-col rounded-2xl border bg-surface p-5', p.pop ? 'border-accent-ring' : 'border-hairline')}>
          {p.pop && <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">Önerilen</span>}
          <div className="text-[14px] font-bold text-ink">{p.name}</div>
          <div className="mt-2 text-[26px] font-extrabold tracking-tight text-ink">
            {p.price} <span className="text-[12px] font-medium text-ink-faint">{p.per}</span>
          </div>
          <ul className="mt-4 flex-1 space-y-2">
            {p.feats.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-ink-muted">
                <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-success" /> {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={p.current}
            className={cn(
              'mt-5 h-10 rounded-xl text-[13.5px] font-semibold transition-colors',
              p.current ? 'cursor-default border border-hairline text-ink-faint' : p.pop ? 'bg-accent text-accent-foreground hover:brightness-110' : 'border border-hairline text-ink hover:bg-surface-subtle',
            )}
          >
            {p.current ? 'Mevcut plan' : `${p.name}’a geç`}
          </button>
        </div>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const [n, setN] = useState({ summary: true, played: true, weekly: false });
  const rows: { key: keyof typeof n; label: string; desc: string }[] = [
    { key: 'summary', label: 'E-posta özetleri', desc: 'Demolarının performansına dair haftalık özet.' },
    { key: 'played', label: 'Demo oynatıldığında', desc: 'Biri demonu oynattığında bildirim al.' },
    { key: 'weekly', label: 'Ürün haberleri', desc: 'Yeni özellikler ve ipuçları.' },
  ];
  return (
    <Card title="Bildirimler" desc="Hangi e-postaları almak istediğini seç.">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[14px] font-semibold text-ink">{r.label}</div>
            <div className="text-[12.5px] text-ink-faint">{r.desc}</div>
          </div>
          <Switch checked={n[r.key]} onChange={(v) => setN((s) => ({ ...s, [r.key]: v }))} />
        </div>
      ))}
    </Card>
  );
}
