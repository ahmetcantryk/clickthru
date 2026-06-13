import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { sampleDemos } from '@clickthru/schema';
import { getDemo } from '@/lib/demos';
import { overridesFromParams } from '@/lib/personalize';
import { Player } from '@/components/player/player';

// Demoyu tek seferde yükle (cache: generateMetadata + sayfa aynı isteği paylaşır, çift sorgu olmaz).
const loadDemo = cache(async (demoId: string) => {
  const fromDb = await getDemo(demoId).catch(() => null);
  return fromDb ?? sampleDemos.find((d) => d.id === demoId) ?? null;
});

/** Paylaşım önizlemesi (Slack/LinkedIn/iMessage) — başlık + açıklama + ilk medya görseli. */
export async function generateMetadata({ params }: { params: Promise<{ demoId: string }> }): Promise<Metadata> {
  const { demoId } = await params;
  const demo = await loadDemo(demoId);
  if (!demo) return { title: 'Demo not found · clickthru' };
  const title = `${demo.title} · clickthru`;
  const description = 'Interactive product demo — play the clickable walkthrough.';
  // og:image yalnız mutlak (http) medya için; data:/relatif örnek yolları atlanır.
  const image = demo.steps.find((s) => /^https?:\/\//.test(s.media))?.media;
  const images = image ? [image] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

// Saf player / paylaşım hedefi. Önce Supabase'den; bulunamazsa örnek demolara düşer.
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ demoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { demoId } = await params;
  const demo = await loadDemo(demoId);

  if (!demo) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
        <p className="text-sm font-semibold text-ink">Demo bulunamadı</p>
        <p className="text-xs text-ink-muted">“{demoId}” için kayıtlı bir demo yok.</p>
        <Link href="/studio" className="text-xs font-medium text-accent hover:underline">
          Studio'ya dön
        </Link>
      </main>
    );
  }

  const vars = overridesFromParams(await searchParams, demo.variables);

  return (
    <main className="h-screen bg-canvas p-4">
      <div className="mx-auto h-full w-full max-w-6xl">
        <Player demo={demo} vars={vars} track />
      </div>
    </main>
  );
}
