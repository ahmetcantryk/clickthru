'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sampleDemos } from '@clickthru/schema';
import { AuthGate, getProfile, getSession, signOut } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { listDemos, type DemoSummary } from '@/lib/demos';
import { NewDemoModal } from '@/components/workspaces/new-demo-modal';
import { AppSidebar, type AppSection } from './app-sidebar';
import { CommandPalette } from './command-palette';

const NewDemoCtx = createContext<() => void>(() => {});
export const useNewDemo = () => useContext(NewDemoCtx);

const DemosCtx = createContext<DemoSummary[] | null>(null);
export const useDemos = () => useContext(DemosCtx);

function sampleSummaries(): DemoSummary[] {
  return sampleDemos.map((d) => ({
    id: d.id,
    title: d.title,
    thumbnail: d.steps.find((s) => s.type === 'screenshot')?.media,
    type: d.steps[0]?.type ?? 'screenshot',
    steps: d.steps.length,
    updatedAt: undefined,
  }));
}

export function AppLayout({ active, children }: { active: AppSection; children: React.ReactNode }) {
  return (
    <AuthGate requireOnboarded>
      <AppLayoutInner active={active}>{children}</AppLayoutInner>
    </AuthGate>
  );
}

function AppLayoutInner({ active, children }: { active: AppSection; children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useT();
  const user = getSession();
  const profile = getProfile();
  const [demos, setDemos] = useState<DemoSummary[] | null>(null);
  const [modal, setModal] = useState(false);
  const [cmd, setCmd] = useState(false);

  const name = user?.name ?? '';
  const workspace = profile?.workspace || (user ? t.workspaceOf(user.name.split(' ')[0]) : t.onboarding.yourWs);
  const brandColor = profile?.brandColor || '#2142E7';

  useEffect(() => {
    let alive = true;
    listDemos()
      .then((d) => alive && setDemos(d.length ? d : sampleSummaries()))
      .catch(() => alive && setDemos(sampleSummaries()));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const checklist = [
    { label: t.checklist.createProfile, done: true },
    { label: t.checklist.firstDemo, done: (demos?.length ?? 0) > 0 },
    { label: t.checklist.addCallout, done: false },
    { label: t.checklist.shareDemo, done: false },
  ];

  return (
    <NewDemoCtx.Provider value={() => setModal(true)}>
      <DemosCtx.Provider value={demos}>
        <div className="flex h-screen bg-canvas font-sans text-ink">
          <AppSidebar
            active={active}
            workspace={workspace}
            name={name}
            email={user?.email ?? ''}
            brandColor={brandColor}
            checklist={active === 'home' ? checklist : undefined}
            onNew={() => setModal(true)}
            onSearch={() => setCmd(true)}
            onSignOut={() => {
              signOut();
              router.replace('/login');
            }}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        {modal && <NewDemoModal onClose={() => setModal(false)} />}
        <CommandPalette open={cmd} onClose={() => setCmd(false)} demos={demos} onNew={() => setModal(true)} />
      </DemosCtx.Provider>
    </NewDemoCtx.Provider>
  );
}
