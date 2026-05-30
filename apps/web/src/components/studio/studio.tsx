'use client';

import { useEffect, useState } from 'react';
import { Play, Save, Share2 } from 'lucide-react';
import { Button, Pill } from '@clickthru/ui';
import { safeValidateDemo, type Demo } from '@clickthru/schema';
import { useEditorStore } from '@/store/editor-store';
import { getErrorMessage, saveDemo } from '@/lib/demos';
import { StepsPanel } from './steps-panel';
import { EditCanvas } from './edit-canvas';
import { CanvasToolbar } from './canvas-toolbar';
import { InspectorPanel } from './inspector-panel';
import { PreviewOverlay } from './preview-overlay';
import { ShareDialog } from './share-dialog';

/** Studio kabuğu: üst bar + 3 kolon (adımlar · düzenleme tuvali · inspector) + önizleme. */
export function Studio({ initialDemo }: { initialDemo?: Demo }) {
  const demo = useEditorStore((s) => s.demo);
  const loadDemo = useEditorStore((s) => s.loadDemo);
  const prepareShare = useEditorStore((s) => s.prepareShare);

  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Paylaşım linkinden gelindiyse (?demo=id) kaydedilmiş demoyu editöre yükle.
  useEffect(() => {
    if (initialDemo) loadDemo(initialDemo);
  }, [initialDemo, loadDemo]);

  function validate() {
    const res = safeValidateDemo(demo);
    setStatus(res.ok ? '✓ Geçerli JSON' : `✕ ${res.errors[0] ?? 'Hata'}`);
    setTimeout(() => setStatus(null), 2500);
  }

  async function share() {
    setBusy(true);
    setStatus(null);
    try {
      const id = prepareShare();
      await saveDemo(useEditorStore.getState().demo);
      // Yenilemede düzenlemeye devam edebilmek için URL'i güncelle.
      window.history.replaceState(null, '', `/studio?demo=${id}`);
      setShareUrl(`${window.location.origin}/play/${id}`);
    } catch (e) {
      setStatus(`✕ ${getErrorMessage(e)}`);
      setTimeout(() => setStatus(null), 4000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent-grad shadow-glow" />
            <span className="text-sm font-semibold tracking-tight text-ink">clickthru</span>
          </div>
          <Pill>Faz 1 · Studio</Pill>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-ink-muted">{status}</span>}
          <Button variant="ghost" size="sm" onClick={validate}>
            <Save className="h-4 w-4" />
            Doğrula
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPreview(true)}>
            <Play className="h-4 w-4" />
            Önizle
          </Button>
          <Button size="sm" onClick={share} disabled={busy}>
            <Share2 className="h-4 w-4" />
            {busy ? 'Kaydediliyor…' : 'Paylaş'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <StepsPanel />
        <main className="flex min-w-0 flex-1 flex-col gap-3 bg-surface-subtle p-6">
          <CanvasToolbar />
          <div className="min-h-0 flex-1">
            <EditCanvas />
          </div>
        </main>
        <InspectorPanel />
      </div>

      {preview && <PreviewOverlay demo={demo} onClose={() => setPreview(false)} />}
      {shareUrl && <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />}
    </div>
  );
}
