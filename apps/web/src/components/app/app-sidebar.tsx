'use client';

import {
  BookOpen,
  ChevronsUpDown,
  CreditCard,
  Home,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Users,
} from 'lucide-react';
import { cn } from '@clickthru/ui';
import { initials } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { DropdownMenu, type MenuItem } from '@/components/ui/menu';

export type AppSection = 'home' | 'library' | 'insights' | 'settings';

interface ChecklistItem {
  label: string;
  done: boolean;
}

const NAV: { key: AppSection; label: string; href: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'Ana sayfa', href: '/workspaces', icon: <Home className="h-4 w-4" /> },
  { key: 'library', label: 'Kitaplık', href: '/library', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'insights', label: 'İçgörüler', href: '/insights', icon: <Sparkles className="h-4 w-4" /> },
];

export function AppSidebar({
  active,
  workspace,
  name,
  email,
  brandColor,
  checklist,
  onNew,
  onSearch,
  onSignOut,
}: {
  active: AppSection;
  workspace: string;
  name: string;
  email: string;
  brandColor: string;
  checklist?: ChecklistItem[];
  onNew: () => void;
  onSearch: () => void;
  onSignOut: () => void;
}) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  const accountItems: MenuItem[] = [
    { label: 'Hesap ayarları', icon: <Settings className="h-4 w-4" />, href: '/settings' },
    { label: 'Faturalandırma', icon: <CreditCard className="h-4 w-4" />, href: '/settings?tab=plan' },
    { label: dark ? 'Açık tema' : 'Koyu tema', icon: dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />, onSelect: toggle },
    { label: 'Çöp kutusu', icon: <Trash2 className="h-4 w-4" />, href: '/library' },
    { kind: 'separator' },
    { label: 'Çıkış yap', icon: <LogOut className="h-4 w-4" />, danger: true, onSelect: onSignOut },
  ];

  const wsItems: MenuItem[] = [
    { label: 'Çalışma alanı ayarları', icon: <Settings className="h-4 w-4" />, href: '/settings' },
    { label: 'Ekip davet et', icon: <Users className="h-4 w-4" />, onSelect: () => { window.location.href = 'mailto:?subject=clickthru ekibine katıl'; } },
  ];

  return (
    <aside className="flex h-screen w-[252px] flex-none flex-col border-r border-hairline bg-surface">
      {/* workspace switcher */}
      <div className="p-3">
        <DropdownMenu
          width={224}
          header={
            <div>
              <div className="text-[13px] font-semibold text-ink">{workspace}</div>
              <div className="text-[11px] text-ink-faint">Free plan</div>
            </div>
          }
          items={wsItems}
          trigger={
            <span className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-subtle">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[13px] font-bold text-white" style={{ background: brandColor }}>
                {workspace.charAt(0).toUpperCase() || 'C'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{workspace}</span>
                <span className="block truncate text-[11.5px] text-ink-faint">Free plan</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 flex-none text-ink-faint" />
            </span>
          }
        />
      </div>

      <div className="px-3">
        <button type="button" onClick={onSearch} className="flex w-full items-center gap-2.5 rounded-lg border border-hairline bg-surface-subtle px-3 py-2 text-sm text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink">
          <Search className="h-4 w-4" /> Ara
          <span className="ml-auto rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px]">⌘K</span>
        </button>
      </div>

      <nav className="mt-3 flex flex-col gap-0.5 px-3">
        {NAV.map((n) => (
          <a
            key={n.key}
            href={n.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-colors',
              active === n.key ? 'bg-accent-muted text-accent' : 'text-ink-muted hover:bg-surface-subtle hover:text-ink',
            )}
          >
            {n.icon}
            {n.label}
          </a>
        ))}
      </nav>

      {checklist && (
        <div className="mx-3 mt-5 rounded-2xl border border-hairline bg-surface-subtle p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wide text-ink-faint">Hazır ol</span>
            <span className="font-mono text-[11px] text-ink-faint">
              {checklist.filter((c) => c.done).length}/{checklist.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
            <span className="block h-full rounded-full bg-accent transition-[width]" style={{ width: `${(checklist.filter((c) => c.done).length / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {checklist.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={c.done ? undefined : onNew} className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left text-[13px] hover:bg-surface">
                  <span className={cn('flex h-4 w-4 flex-none items-center justify-center rounded-[5px] border', c.done ? 'border-accent bg-accent text-accent-foreground' : 'border-hairline-strong')}>
                    {c.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>}
                  </span>
                  <span className={cn(c.done ? 'text-ink-faint line-through' : 'text-ink')}>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-3 pt-4">
        <button onClick={onNew} type="button" className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-[13.5px] font-semibold text-accent-foreground shadow-glow hover:brightness-110">
          <Plus className="h-4 w-4" /> Yeni demo
        </button>
      </div>

      {/* account menu (bottom-left) */}
      <div className="mt-auto border-t border-hairline p-3">
        <DropdownMenu
          side="top"
          width={224}
          header={
            <div>
              <div className="truncate text-[13px] font-semibold text-ink">{name}</div>
              <div className="truncate text-[11px] text-ink-faint">{email}</div>
            </div>
          }
          items={accountItems}
          trigger={
            <span className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-subtle">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: brandColor }}>
                {name ? initials(name) : '–'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">{name}</span>
                <span className="block truncate text-[11px] text-ink-faint">{email}</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 flex-none text-ink-faint" />
            </span>
          }
        />
      </div>
    </aside>
  );
}
