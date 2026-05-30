'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { Button } from '@clickthru/ui';

/** Kaydedilen demonun public paylaşım linkini gösterir + panoya kopyalar. */
export function ShareDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // pano erişimi engellenmişse kullanıcı linki elle seçebilir.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-5 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Demo paylaşıma hazır 🎉</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-ink-faint hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-muted">Bu bağlantıyı paylaş — açan herkes demoyu oynatabilir.</p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-hairline bg-surface-subtle px-3 py-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="w-full bg-transparent font-mono text-xs text-ink outline-none"
          />
          <button
            type="button"
            onClick={copy}
            aria-label="Kopyala"
            className="shrink-0 text-ink-faint transition-colors hover:text-accent"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Aç
            </a>
          </Button>
          <Button size="sm" onClick={copy}>
            {copied ? 'Kopyalandı' : 'Linki kopyala'}
          </Button>
        </div>
      </div>
    </div>
  );
}
