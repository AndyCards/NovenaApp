// Invisible helper that keeps the phone's reminders up to date. It re-plans them when the app opens,
// when the app comes back to the front, and whenever anything is saved (see state/dataVersion.ts).
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useCatalog } from '@/hooks/useCatalog';
import { useDataVersion } from '@/state/dataVersion';
import { syncReminders } from '@/utils/syncReminders';

export function ReminderSync() {
  const { catalog } = useCatalog();
  const version = useDataVersion((s) => s.version);

  useEffect(() => { syncReminders(catalog).catch(() => {}); }, [catalog, version]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncReminders(catalog).catch(() => {});
    });
    return () => sub.remove();
  }, [catalog]);

  return null;
}
