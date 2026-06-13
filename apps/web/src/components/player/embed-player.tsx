'use client';

import { useEffect, useState } from 'react';
import type { Demo } from '@clickthru/schema';
import { overridesFromParams } from '@/lib/personalize';
import { Player } from './player';

/**
 * Gömülü (iframe) player. `?export=1` ise kontroller gizli + otomatik oynatma
 * (render-worker'ın video/GIF kaydı için); normalde interaktif.
 * `?key=değer` paramları kişiselleştirme override'ı olarak çözülür.
 */
export function EmbedPlayer({ demo }: { demo: Demo }) {
  const [exportMode, setExportMode] = useState(false);
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('export') === '1') setExportMode(true);
    setVars(overridesFromParams(sp, demo.variables));
  }, [demo.variables]);

  return exportMode ? (
    <Player demo={demo} vars={vars} hideControls autoAdvanceMs={3600} />
  ) : (
    <Player demo={demo} vars={vars} />
  );
}
