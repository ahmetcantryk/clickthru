'use client';

import { useEffect } from 'react';
import { recordView } from '@/lib/analytics';

/** Görünmez — mount'ta bir görüntülenme kaydeder (RLS: yalnız public demo sayılır). */
export function ViewTracker({ demoId }: { demoId: string }) {
  useEffect(() => {
    void recordView(demoId);
  }, [demoId]);
  return null;
}
