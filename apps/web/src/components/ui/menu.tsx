'use client';

import * as React from 'react';
import { cn } from '@clickthru/ui';

export type MenuItem =
  | {
      kind?: 'item';
      label: string;
      icon?: React.ReactNode;
      onSelect?: () => void;
      href?: string;
      danger?: boolean;
      shortcut?: string;
      trailing?: React.ReactNode;
    }
  | { kind: 'separator' }
  | { kind: 'label'; label: string };

/** shadcn tarzı açılır menü (Radix'siz, tema-duyarlı). Trigger'a tıkla → panel. */
export function DropdownMenu({
  trigger,
  items,
  side = 'bottom',
  align = 'start',
  width = 224,
  header,
  className,
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
  width?: number;
  header?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-ring rounded-xl">
        {trigger}
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 overflow-hidden rounded-xl border border-hairline bg-surface-elevated p-1.5 shadow-soft animate-[fadein_.12s_ease]',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'end' ? 'right-0' : 'left-0',
          )}
          style={{ width }}
        >
          {header && <div className="mb-1 border-b border-hairline px-2.5 pb-2.5 pt-1">{header}</div>}
          {items.map((it, i) => {
            if (it.kind === 'separator') return <div key={i} className="my-1.5 h-px bg-hairline" />;
            if (it.kind === 'label')
              return (
                <div key={i} className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                  {it.label}
                </div>
              );
            const cls = cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors',
              it.danger ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-subtle',
            );
            const inner = (
              <>
                {it.icon && <span className={cn('flex-none', it.danger ? '' : 'text-ink-faint')}>{it.icon}</span>}
                <span className="flex-1 truncate">{it.label}</span>
                {it.shortcut && <span className="font-mono text-[11px] text-ink-faint">{it.shortcut}</span>}
                {it.trailing}
              </>
            );
            return it.href ? (
              <a key={i} href={it.href} className={cls} onClick={() => setOpen(false)}>
                {inner}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                className={cls}
                onClick={() => {
                  setOpen(false);
                  it.onSelect?.();
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
