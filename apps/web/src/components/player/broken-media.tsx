import { ImageOff } from 'lucide-react';

/** Bozuk/eksik medya fallback'i — player çökmez (ACCEPTANCE §2 sınır testi). */
export function BrokenMedia() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-subtle text-ink-faint">
      <ImageOff className="h-8 w-8" strokeWidth={1.5} />
      <span className="text-sm">Medya yüklenemedi</span>
    </div>
  );
}
