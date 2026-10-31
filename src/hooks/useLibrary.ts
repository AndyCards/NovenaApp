// One place for the Library's data: novenas being prayed, finished ones, and saved ones,
// plus the actions to save, unsave, pause, resume, restart or remove them.
import { useCallback, useEffect, useState } from 'react';
import { listSaved, saveNovena, undoUnsave, unsaveNovena } from '@/data/queries';
import { useRuns } from './useNovenaRun';

export function useLibrary() {
  const runsApi = useRuns();
  const [saved, setSaved] = useState<string[]>([]);
  const refreshSaved = useCallback(async () => setSaved((await listSaved()).map((s) => s.novenaId)), []);
  useEffect(() => { refreshSaved(); }, [refreshSaved]);

  const active = runsApi.runs.filter((r) => r.status === 'active' || r.status === 'paused');
  const completed = runsApi.runs.filter((r) => r.status === 'completed');

  return {
    ...runsApi,
    active,
    completed,
    saved,
    save: async (id: string) => { await saveNovena(id); await refreshSaved(); },
    unsave: async (id: string) => { await unsaveNovena(id); await refreshSaved(); },
    undoUnsave: async (id: string) => { await undoUnsave(id); await refreshSaved(); },
    isSaved: (id: string) => saved.includes(id),
  };
}
