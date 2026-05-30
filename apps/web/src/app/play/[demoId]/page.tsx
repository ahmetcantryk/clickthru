import Link from 'next/link';
import { sampleDemos } from '@clickthru/schema';
import { getDemo } from '@/lib/demos';
import { Player } from '@/components/player/player';

// Saf player / paylaşım hedefi. Önce Supabase'den; bulunamazsa örnek demolara düşer.
export default async function PlayPage({ params }: { params: Promise<{ demoId: string }> }) {
  const { demoId } = await params;
  const fromDb = await getDemo(demoId).catch(() => null);
  const demo = fromDb ?? sampleDemos.find((d) => d.id === demoId);

  if (!demo) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-3 bg-surface-subtle p-6 text-center">
        <p className="text-sm font-semibold text-ink">Demo bulunamadı</p>
        <p className="text-xs text-ink-muted">“{demoId}” için kayıtlı bir demo yok.</p>
        <Link href="/studio" className="text-xs font-medium text-accent hover:underline">
          Studio'ya dön
        </Link>
      </main>
    );
  }

  return (
    <main className="h-screen bg-surface-subtle p-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <Player demo={demo} />
      </div>
    </main>
  );
}
