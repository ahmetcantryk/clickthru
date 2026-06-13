'use client';

import { useEffect, useState } from 'react';
import { Check, PanelLeft, PanelRight, Pencil, Play, Share2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button, cn } from '@clickthru/ui';
import { safeValidateDemo, type Demo } from '@clickthru/schema';
import { useEditorStore } from '@/store/editor-store';
import { getErrorMessage, saveDemo } from '@/lib/demos';
import { useT } from '@/lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';
import { StepsPanel } from './steps-panel';
import { EditCanvas } from './edit-canvas';
import { CanvasToolbar } from './canvas-toolbar';
import { InspectorPanel } from './inspector-panel';
import { PreviewOverlay } from './preview-overlay';
import { ExportDialog } from './export-dialog';

type Status = { kind: 'success' | 'error'; text: string } | null;

/** Studio kabuğu: üst bar + 3 kolon (adımlar · düzenleme tuvali · inspector) + önizleme. */
export function Studio({ initialDemo }: { initialDemo?: Demo }) {
  const { t } = useT();
  const demo = useEditorStore((s) => s.demo);
  const loadDemo = useEditorStore((s) => s.loadDemo);
  const prepareShare = useEditorStore((s) => s.prepareShare);
  const select = useEditorStore((s) => s.select);

  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  // macOS tarzı açılır-kapanır paneller.
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Paylaşım linkinden gelindiyse (?demo=id) kaydedilmiş demoyu editöre yükle.
  useEffect(() => {
    if (initialDemo) loadDemo(initialDemo);
  }, [initialDemo, loadDemo]);

  function validate() {
    const res = safeValidateDemo(demo);
    setStatus(res.ok ? { kind: 'success', text: t.studio.validJson } : { kind: 'error', text: res.errors[0] ?? t.studio.invalid });
    setTimeout(() => setStatus(null), 2800);
  }

  async function share() {
    setBusy(true);
    setStatus(null);
    try {
      const id = prepareShare();
      await saveDemo(useEditorStore.getState().demo);
      // Yenilemede düzenlemeye devam edebilmek için URL'i güncelle.
      window.history.replaceState(null, '', `/studio?demo=${id}`);
      setShareId(id);
    } catch (e) {
      setStatus({ kind: 'error', text: getErrorMessage(e) });
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="z-20 flex h-14 flex-none items-center gap-3 border-b border-hairline bg-surface px-4">
        <PanelToggle side="left" open={leftOpen} onClick={() => setLeftOpen((v) => !v)} />
        <a href="/workspaces" title={t.studio.backToWorkspace} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-ring">
          <Logo />
        </a>
        <span className="h-5 w-px bg-hairline" />
        <button
          type="button"
          onClick={() => select({ kind: 'demo' })}
          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink hover:bg-surface-subtle"
        >
          <span className="text-sm font-semibold">{demo.title}</span>
          <Pencil className="h-3 w-3 text-ink-faint transition-colors group-hover:text-ink-muted" />
        </button>

        <div className="flex-1" />

        {status && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
              status.kind === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
            )}
          >
            {status.kind === 'success' ? <Check className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
            {status.text}
          </span>
        )}

        <Button variant="ghost" size="sm" onClick={validate}>
          <ShieldCheck className="h-4 w-4" />
          {t.studio.validate}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreview(true)}>
          <Play className="h-4 w-4" />
          {t.studio.preview}
        </Button>
        <Button size="sm" onClick={share} disabled={busy}>
          {busy ? <span className="spinner" /> : <Share2 className="h-4 w-4" />}
          {busy ? t.studio.saving : t.studio.share}
        </Button>

        <span className="mx-0.5 h-5 w-px bg-hairline" />
        <ThemeToggle />
        <PanelToggle side="right" open={rightOpen} onClick={() => setRightOpen((v) => !v)} />
      </header>

      <div className="flex min-h-0 flex-1">
        <StepsPanel open={leftOpen} onCollapse={() => setLeftOpen(false)} />
        <main className="canvas-pit relative flex min-w-0 flex-1 flex-col p-8 pb-28">
          <div className="min-h-0 flex-1">
            <EditCanvas />
          </div>
          <CanvasToolbar />
        </main>
        <InspectorPanel open={rightOpen} onCollapse={() => setRightOpen(false)} />
      </div>

      {preview && <PreviewOverlay demo={demo} onClose={() => setPreview(false)} />}
      {shareId && <ExportDialog demoId={shareId} variables={demo.variables} onClose={() => setShareId(null)} />}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-glow">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <path
            d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z"
            fill="oklch(var(--on-accent))"
          />
        </svg>
      </div>
      <span className="text-base font-bold tracking-tight text-ink">clickthru</span>
    </div>
  );
}

/** Üst bar panel aç/kapa düğmesi (macOS sidebar tarzı). */
function PanelToggle({ side, open, onClick }: { side: 'left' | 'right'; open: boolean; onClick: () => void }) {
  const { t } = useT();
  const Icon = side === 'left' ? PanelLeft : PanelRight;
  const name = side === 'left' ? t.studio.steps : t.studio.inspector;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t.studio.togglePanel(name, open)}
      title={t.studio.togglePanel(name, open)}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
        open
          ? 'border-transparent text-ink-muted hover:bg-surface-subtle hover:text-ink'
          : 'border-hairline bg-accent-muted text-accent',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
