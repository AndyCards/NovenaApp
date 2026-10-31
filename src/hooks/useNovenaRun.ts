// Loads every novena the person has started (a "run") and works out, for each one, which days were
// prayed, which were missed, and which day to continue with today.
import { useCallback, useEffect, useState } from 'react';
import { listAllCompletions, listRuns, setRunStatus, softRemoveRun, startRun, undoRemoveRun } from '@/data/queries';
import { todayString } from '@/utils/dateUtils';
import { continueDay, dayState, isCompleted, missedDays } from '@/utils/dayRules';

type Run = Awaited<ReturnType<typeof listRuns>>[number];

export interface RunView extends Run {
  prayedDays: number[];
  missed: number[];
  continueDay: number;
}

export function useRuns() {
  const [runs, setRuns] = useState<RunView[]>([]);
  const refresh = useCallback(async () => {
    const [rs, cs] = await Promise.all([listRuns(), listAllCompletions()]);
    const today = todayString();
    setRuns(
      rs.map((r) => {
        const prayedDays = cs.filter((c) => c.runId === r.id).map((c) => c.day);
        return { ...r, prayedDays, missed: missedDays(prayedDays, r.startedOn, today), continueDay: continueDay(prayedDays, r.startedOn, today) };
      }),
    );
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  return {
    runs,
    refresh,
    start: async (novenaId: string, restartedFrom?: string) => { const id = await startRun(novenaId, todayString(), restartedFrom); await refresh(); return id; },
    pause: async (runId: string) => { await setRunStatus(runId, 'paused', todayString()); await refresh(); },
    resume: async (runId: string) => { await setRunStatus(runId, 'active', todayString()); await refresh(); },
    quit: async (runId: string) => { await softRemoveRun(runId); await refresh(); },
    undoQuit: async (runId: string) => { await undoRemoveRun(runId); await refresh(); },
    stateOf: (run: RunView, day: number) => dayState(day, run.prayedDays, run.startedOn, todayString()),
    isDone: (run: RunView) => isCompleted(run.prayedDays),
  };
}
