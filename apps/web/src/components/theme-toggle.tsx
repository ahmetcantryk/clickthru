'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useTheme } from '@/lib/theme';

/** Üst barda dark/light geçiş düğmesi. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={isDark ? 'Açık tema' : 'Koyu tema'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-surface-subtle text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink',
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
