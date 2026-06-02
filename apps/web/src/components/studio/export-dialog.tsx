'use client';

import { useEffect, useState } from 'react';
import { Check, Code2, Copy, Download, ExternalLink, Film, Link2, X } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useT } from '@/lib/i18n';

type Tab = 'link' | 'embed' | 'video';
type Format = 'mp4' | 'gif';
type VideoState = 'idle' | 'rendering' | 'done' | 'unconfigured' | 'error';

/** Paylaş & dışa aktar — link · HTML embed · video/GIF (sunucu-taraflı). */
export function ExportDialog({ demoId, onClose }: { demoId: string; onClose: () => void }) {
  const { t } = useT();
  const [origin, setOrigin] = useState('');
  const [tab, setTab] = useState<Tab>('link');

  useEffect(() => setOrigin(window.location.origin), []);

  const playUrl = `${origin}/play/${demoId}`;
  const embedUrl = `${origin}/embed/${demoId}`;
  const snippet = `<iframe src="${embedUrl}" width="100%" height="450" style="border:0;border-radius:16px;overflow:hidden" loading="lazy" allow="fullscreen"></iframe>`;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'link', label: t.exportDialog.tabs.link, icon: <Link2 className="h-4 w-4" /> },
    { key: 'embed', label: t.exportDialog.tabs.embed, icon: <Code2 className="h-4 w-4" /> },
    { key: 'video', label: t.exportDialog.tabs.video, icon: <Film className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-hairline bg-surface p-5 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">{t.exportDialog.title} 🎉</h2>
          <button type="button" onClick={onClose} aria-label={t.common.close} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl border border-hairline bg-surface-subtle p-1">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors', tab === tb.key ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink')}
            >
              {tb.icon}
              {tb.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === 'link' && <LinkTab url={playUrl} />}
          {tab === 'embed' && <EmbedTab snippet={snippet} embedUrl={embedUrl} />}
          {tab === 'video' && <VideoTab demoId={demoId} />}
        </div>
      </div>
    </div>
  );
}

function CopyField({ value, mono = true }: { value: string; mono?: boolean }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // pano engelliyse kullanıcı elle seçer
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-subtle px-3 py-2">
      <input readOnly value={value} onFocus={(e) => e.target.select()} className={cn('w-full bg-transparent text-xs text-ink outline-none', mono && 'font-mono')} />
      <button type="button" onClick={copy} aria-label={t.common.copy} className="shrink-0 text-ink-faint transition-colors hover:text-accent">
        {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LinkTab({ url }: { url: string }) {
  const { t } = useT();
  return (
    <div>
      <p className="mb-2 text-xs text-ink-muted">{t.exportDialog.linkDesc}</p>
      <CopyField value={url} />
      <div className="mt-4 flex justify-end">
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-hairline bg-surface-subtle px-3.5 text-[13px] font-semibold text-ink hover:bg-surface-raised">
          <ExternalLink className="h-4 w-4" /> {t.exportDialog.open}
        </a>
      </div>
    </div>
  );
}

function EmbedTab({ snippet, embedUrl }: { snippet: string; embedUrl: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // yoksay
    }
  }
  return (
    <div>
      <p className="mb-2 text-xs text-ink-muted">{t.exportDialog.embedDesc}</p>
      <div className="relative rounded-xl border border-hairline bg-surface-subtle p-3">
        <code className="block break-all pr-8 font-mono text-[11.5px] leading-relaxed text-ink">{snippet}</code>
        <button type="button" onClick={copy} aria-label={t.common.copy} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface hover:text-accent">
          {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{t.exportDialog.preview}</p>
      <iframe src={embedUrl} title={t.exportDialog.preview} className="aspect-video w-full rounded-xl border border-hairline" loading="lazy" />
    </div>
  );
}

function VideoTab({ demoId }: { demoId: string }) {
  const { t } = useT();
  const [format, setFormat] = useState<Format>('mp4');
  const [state, setState] = useState<VideoState>('idle');
  const [err, setErr] = useState('');

  async function run() {
    setState('rendering');
    setErr('');
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ demoId, format }),
      });
      if (res.status === 503) {
        setState('unconfigured');
        return;
      }
      if (!res.ok) throw new Error((await res.text()) || `${t.exportDialog.errorPre}${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${demoId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setState('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.exportDialog.unknownErr);
      setState('error');
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink-muted">{t.exportDialog.videoDesc}</p>
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-hairline bg-surface-subtle p-1">
          {(['mp4', 'gif'] as Format[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={cn('rounded-lg px-4 py-1.5 text-[13px] font-semibold uppercase transition-colors', format === f ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink')}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={state === 'rendering'}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-glow transition-all hover:brightness-110 disabled:opacity-50"
        >
          {state === 'rendering' ? <><span className="spinner" /> {t.exportDialog.rendering}</> : <><Download className="h-4 w-4" /> {t.exportDialog.export}</>}
        </button>
      </div>

      {state === 'done' && <p className="mt-3 text-xs font-medium text-success">{t.exportDialog.done}</p>}
      {state === 'error' && <p className="mt-3 break-all text-xs text-danger">{t.exportDialog.errorPre}{err}</p>}
      {state === 'unconfigured' && (
        <div className="mt-3 rounded-xl border border-warn/30 bg-warn-soft/50 p-3 text-[12.5px] text-ink-muted">
          {t.exportDialog.unconfigured}
        </div>
      )}
    </div>
  );
}
