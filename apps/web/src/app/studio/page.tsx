import { Studio } from '@/components/studio/studio';
import { getDemo, blankDemo } from '@/lib/demos';
import { AuthGate } from '@/lib/auth';

// Editör (Kapı 3) — oturum gerektirir. `?demo=id` kayıtlı demoyu, `?new=1` boş demoyu açar.
export default async function StudioPage({ searchParams }: { searchParams: Promise<{ demo?: string; new?: string }> }) {
  const { demo: demoId, new: isNew } = await searchParams;
  const initialDemo = isNew ? blankDemo() : demoId ? await getDemo(demoId).catch(() => null) : null;

  return (
    <AuthGate>
      <Studio initialDemo={initialDemo ?? undefined} />
    </AuthGate>
  );
}
