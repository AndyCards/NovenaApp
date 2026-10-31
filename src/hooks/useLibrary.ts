// One place for the Library's data: novenas being prayed, finished ones, and saved ones,
// plus the actions to save, unsave, pause, resume, restart or remove them.
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { listSaved, saveNovena, undoUnsave, unsaveNovena } from '@/data/queries';
import { dataChanged, useDataVersion } from '@/state/dataVersion';
import { useRuns } from './useNovenaRun';

export function useLibrary() {
  const runsApi = useRuns();
  const [saved, setSaved] = useState<string[]>([]);
  const refreshSaved = useCallback(async () => setSaved((await listSaved()).map((s) => s.novenaId)), []);
  const version = useDataVersion((s) => s.version);
  useEffect(() => { refreshSaved(); }, [refreshSaved, version]);
  useFocusEffect(useCallback(() => { refreshSaved(); }, [refreshSaved]));

  const active = runsApi.runs.filter((r) => r.status === 'active' || r.status === 'paused');
  const completed = runsApi.runs.filter((r) => r.status === 'completed');

  return {
    ...runsApi,
    active,
    completed,
    saved,
    save: async (id: string) => { await saveNovena(id); dataChanged(); },
    unsave: async (id: string) => { await unsaveNovena(id); dataChanged(); },
    undoUnsave: async (id: string) => { await undoUnsave(id); dataChanged(); },
    isSaved: (id: string) => saved.includes(id),
  };
}
