import { sampleDemos } from '@clickthru/schema';
import { getDemo } from '@/lib/demos';
import { EmbedPlayer } from '@/components/player/embed-player';

// Gömülebilir (iframe) hedef — sade, tam ekran player. /play gibi ama chrome'suz.
// Analitik (view + tamamlanma) EmbedPlayer içinde; `?export=1` (render-worker) kayıtta kapalı.
export default async function EmbedPage({ params }: { params: Promise<{ demoId: string }> }) {
  const { demoId } = await params;
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
      <EmbedPlayer demo={demo} />
    </main>
  );
}
