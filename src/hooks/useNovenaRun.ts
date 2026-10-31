// Loads every novena the person has started (a "run") and works out, for each one, which days were
// prayed, which were missed, and which day to continue with today.
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { listAllCompletions, listRuns, setRunStatus, softRemoveRun, startRun, undoRemoveRun } from '@/data/queries';
import { dataChanged, useDataVersion } from '@/state/dataVersion';
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
  const [loaded, setLoaded] = useState(false); // false until the first load from the phone finishes
  const refresh = useCallback(async () => {
    const [rs, cs] = await Promise.all([listRuns(), listAllCompletions()]);
    const today = todayString();
    setRuns(
      rs.map((r) => {
        const prayedDays = cs.filter((c) => c.runId === r.id).map((c) => c.day);
        return { ...r, prayedDays, missed: missedDays(prayedDays, r.startedOn, today), continueDay: continueDay(prayedDays, r.startedOn, today) };
      }),
    );
    setLoaded(true);
  }, []);
  // Reload when anything is saved anywhere in the app, and whenever this screen comes back into view
  // (for example the next morning, so "today" moves on).
  const version = useDataVersion((s) => s.version);
  useEffect(() => { refresh(); }, [refresh, version]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  // Every action saves to the phone, then tells all screens to reload.
  const write = async <T,>(job: () => Promise<T>) => { const out = await job(); dataChanged(); return out; };

  return {
    runs,
    refresh,
    loaded,
    start: (novenaId: string, restartedFrom?: string) => write(() => startRun(novenaId, todayString(), restartedFrom)),
    pause: (runId: string) => write(() => setRunStatus(runId, 'paused', todayString())),
    resume: (runId: string) => write(() => setRunStatus(runId, 'active', todayString())),
    /** Ends a run without hiding it from history (used when starting the same novena again). */
    end: (runId: string) => write(() => setRunStatus(runId, 'quit', todayString())),
    quit: (runId: string) => write(() => softRemoveRun(runId)),
    undoQuit: (runId: string) => write(() => undoRemoveRun(runId)),
    stateOf: (run: RunView, day: number) => dayState(day, run.prayedDays, run.startedOn, todayString()),
    isDone: (run: RunView) => isCompleted(run.prayedDays),
  };
}
