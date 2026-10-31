// Reads and changes the reminder settings (time, weekdays, extras) and re-plans the phone's
// notifications every time something changes.
import { useCallback, useEffect, useState } from 'react';
import { getReminderSettings, saveReminderSettings } from '@/data/queries';
import { ensurePermission, permissionGranted, rescheduleReminders } from '@/utils/notifications';
import { todayString } from '@/utils/dateUtils';
import { useCatalog } from './useCatalog';
import { useRuns } from './useNovenaRun';

type Settings = Awaited<ReturnType<typeof getReminderSettings>>;

export function useReminders() {
  const { novenaById } = useCatalog();
  const { runs } = useRuns();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [permission, setPermission] = useState(true);

  const reschedule = useCallback(async (s: Settings) => {
    await rescheduleReminders(
      s,
      runs.filter((r) => r.status === 'active').map((r) => ({
        runId: r.id, novenaTitle: novenaById(r.novenaId)?.title ?? '', startedOn: r.startedOn, prayedDays: r.prayedDays, remindersOn: true,
      })),
      todayString(),
    );
  }, [runs, novenaById]);

  useEffect(() => {
    getReminderSettings().then(setSettings);
    permissionGranted().then(setPermission);
  }, []);

  return {
    settings,
    permission, // false → show the "Reminders are off" banner
    update: async (patch: Partial<NonNullable<Settings>>) => {
      if (patch.enabled) setPermission(await ensurePermission());
      await saveReminderSettings(patch);
      const next = await getReminderSettings();
      setSettings(next);
      await reschedule(next);
    },
  };
}
