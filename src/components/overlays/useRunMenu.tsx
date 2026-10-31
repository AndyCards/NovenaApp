// The "…" menu for a novena you are praying (pause or resume, start again, remove), for use on Home.
// Same menu, pop-ups and Undo message as the Library, so the "…" behaves the same wherever it appears.
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { strings } from '@/copy/strings';
import type { useRuns } from '@/hooks/useNovenaRun';
import { AlertCard, type AlertKind } from './AlertCard';
import { CardMenu } from './CardMenu';
import { Toast } from './Toast';

export function useRunMenu(runsApi: ReturnType<typeof useRuns>): { openMenu: (runId: string, anchorBottom: number) => void; menus: ReactNode } {
  const router = useRouter();
  const [menuRun, setMenuRun] = useState<string | null>(null);
  const [menuY, setMenuY] = useState(0); // where the "…" button is on screen, so the menu opens under it
  const [alert, setAlert] = useState<AlertKind | null>(null);
  const [toast, setToast] = useState<{ message: string; undo: () => void } | null>(null);
  const run = runsApi.runs.find((r) => r.id === menuRun);
  const L = strings.library;

  const menus = (
    <>
      <CardMenu visible={!!menuRun && !alert} anchorBottom={menuY} paused={run?.status === 'paused'} onClose={() => setMenuRun(null)}
        onPause={async () => { await runsApi.pause(menuRun!); setMenuRun(null); }}
        onResume={async () => { await runsApi.resume(menuRun!); setMenuRun(null); }}
        onRestart={() => setAlert({ kind: 'prayAgain' })}
        onRemove={() => setAlert({ kind: 'remove' })} />
      <AlertCard alert={alert} onClose={() => { setAlert(null); setMenuRun(null); }}
        // "Start again?": the dark button begins a fresh run from Day 1. "Remove novena?": "Stop novena" removes it, with Undo.
        onPrimary={async () => {
          if (run && alert?.kind === 'prayAgain') {
            if (run.status === 'active' || run.status === 'paused') await runsApi.end(run.id);
            const newId = await runsApi.start(run.novenaId, run.id);
            router.push(`/reader/${newId}/1`);
          }
          setAlert(null); setMenuRun(null);
        }}
        onSecondary={async () => {
          if (run && alert?.kind === 'remove') {
            const id = run.id;
            await runsApi.quit(id);
            setToast({ message: L.novenaRemoved, undo: () => runsApi.undoQuit(id) });
          }
          setAlert(null); setMenuRun(null);
        }} />
      {toast && <Toast message={toast.message} onUndo={() => { toast.undo(); setToast(null); }} onDismiss={() => setToast(null)} />}
    </>
  );
  return { openMenu: (runId, anchorBottom) => { setMenuY(anchorBottom); setMenuRun(runId); }, menus };
}
