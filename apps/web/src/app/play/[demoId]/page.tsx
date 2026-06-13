import Link from 'next/link';
import { sampleDemos } from '@clickthru/schema';
import { getDemo } from '@/lib/demos';
import { overridesFromParams } from '@/lib/personalize';
import { Player } from '@/components/player/player';
import { ViewTracker } from '@/components/player/view-tracker';

// Saf player / paylaşım hedefi. Önce Supabase'den; bulunamazsa örnek demolara düşer.
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ demoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { demoId } = await params;
  const fromDb = await getDemo(demoId).catch(() => null);
  const demo = fromDb ?? sampleDemos.find((d) => d.id === demoId);

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
      <ViewTracker demoId={demo.id} />
      <div className="mx-auto h-full w-full max-w-6xl">
        <Player demo={demo} vars={vars} />
      </div>
    </main>
  );
}
