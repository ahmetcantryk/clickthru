'use client';

import { useEffect, useState } from 'react';
import type { Demo } from '@clickthru/schema';
import { Player } from './player';

/**
 * Gömülü (iframe) player. `?export=1` ise kontroller gizli + otomatik oynatma
 * (render-worker'ın video/GIF kaydı için); normalde interaktif.
 */
export function EmbedPlayer({ demo }: { demo: Demo }) {
  const [exportMode, setExportMode] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('export') === '1') setExportMode(true);
  }, []);

  return exportMode ? <Player demo={demo} hideControls autoAdvanceMs={3600} /> : <Player demo={demo} />;
}
