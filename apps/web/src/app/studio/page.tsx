import { Studio } from '@/components/studio/studio';
import { getDemo } from '@/lib/demos';

// Faz 1 odak ekranı — editör (Kapı 3). `?demo=id` ile kaydedilmiş demo yüklenir.
export default async function StudioPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo: demoId } = await searchParams;
  const initialDemo = demoId ? await getDemo(demoId).catch(() => null) : null;

  return <Studio initialDemo={initialDemo ?? undefined} />;
}
