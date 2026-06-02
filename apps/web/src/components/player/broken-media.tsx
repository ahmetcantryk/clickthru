'use client';

import { ImageOff } from 'lucide-react';
import { useT } from '@/lib/i18n';

/** Bozuk/eksik medya fallback'i — player çökmez (ACCEPTANCE §2 sınır testi). */
export function BrokenMedia() {
  const { t } = useT();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-subtle text-ink-faint">
      <ImageOff className="h-8 w-8" strokeWidth={1.5} />
      <span className="text-sm">{t.studio.mediaFailed}</span>
    </div>
  );
}
