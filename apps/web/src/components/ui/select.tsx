'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@clickthru/ui';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

/** shadcn tarzı, tema-duyarlı, klavye-erişilebilir özel select (native değil). */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Seç…',
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [up, setUp] = React.useState(false);
  const [hi, setHi] = React.useState(-1);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function openMenu() {
    const r = wrapRef.current?.getBoundingClientRect();
    setUp(!!r && r.bottom + 300 > window.innerHeight && r.top > 320);
    setHi(options.findIndex((o) => o.value === value));
    setOpen(true);
  }

  function commit(v: string) {
    onValueChange(v);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHi((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hi >= 0 && options[hi]) commit(options[hi].value);
    }
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-surface px-4 text-[15px] outline-none transition-colors',
          open ? 'border-accent-ring ring-2 ring-accent-ring' : 'border-hairline hover:border-hairline-strong',
        )}
      >
        <span className={cn('flex items-center gap-2 truncate', selected ? 'text-ink' : 'text-ink-faint')}>
          {selected?.icon}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 flex-none text-ink-faint transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 right-0 z-50 max-h-72 overflow-auto rounded-xl border border-hairline bg-surface-elevated p-1.5 shadow-soft',
            'animate-[fadein_.12s_ease]',
            up ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          )}
        >
          {options.map((o, i) => {
            const sel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={sel}
                onMouseEnter={() => setHi(i)}
                onClick={() => commit(o.value)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] transition-colors',
                  i === hi ? 'bg-surface-subtle text-ink' : 'text-ink-muted',
                  sel && 'font-semibold text-ink',
                )}
              >
                {o.icon && <span className="text-ink-faint">{o.icon}</span>}
                <span className="flex-1 truncate">{o.label}</span>
                {sel && <Check className="h-4 w-4 flex-none text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
