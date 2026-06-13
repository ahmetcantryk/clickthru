import { sampleDemos } from '@clickthru/schema';
import { getDemo } from '@/lib/demos';
import { EmbedPlayer } from '@/components/player/embed-player';
import { ViewTracker } from '@/components/player/view-tracker';

// Gömülebilir (iframe) hedef — sade, tam ekran player. /play gibi ama chrome'suz.
export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ demoId: string }>;
  searchParams: Promise<{ export?: string }>;
}) {
  const { demoId } = await params;
  const isExport = (await searchParams).export === '1';
  const demo = (await getDemo(demoId).catch(() => null)) ?? sampleDemos.find((d) => d.id === demoId);

  if (!demo) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-[#11131c] text-sm text-white/60">
        Demo bulunamadı
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden" style={{ background: '#11131c' }}>
      {!isExport && <ViewTracker demoId={demo.id} />}
      <EmbedPlayer demo={demo} />
    </main>
  );
}
