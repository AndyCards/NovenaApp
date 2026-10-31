// Reads and changes the reminder settings (time, weekdays, extras). After every change it tells the
// app that something changed, and the reminder planner (ReminderSync) re-plans the phone's notifications.
import { useEffect, useRef, useState } from 'react';
import { getReminderSettings, saveReminderSettings } from '@/data/queries';
import { dataChanged } from '@/state/dataVersion';
import { ensurePermission, permissionGranted } from '@/utils/notifications';

type Settings = Awaited<ReturnType<typeof getReminderSettings>>;
type Patch = Partial<NonNullable<Settings>>;

export function useReminders() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [permission, setPermission] = useState(true);
  // Changes are saved one after another, so two quick taps can't overwrite each other.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    getReminderSettings().then(setSettings);
    permissionGranted().then(setPermission);
  }, []);

  const apply = (makePatch: (current: NonNullable<Settings>) => Patch) => {
    queue.current = queue.current.then(async () => {
      const current = await getReminderSettings(); // always start from what is really saved
      const patch = makePatch(current);
      if (patch.enabled) {
        const granted = await ensurePermission();
        setPermission(granted);
        if (!granted) patch.enabled = false; // the phone said no, so the switch must stay off
      }
      await saveReminderSettings(patch);
      setSettings(await getReminderSettings());
      dataChanged();
    });
    return queue.current;
  };

  return {
    settings,
    permission, // false → show the "Reminders are off" banner
    update: (patch: Patch) => apply(() => patch),
    /** Turn one weekday on or off, based on the latest saved value. */
    toggleWeekday: (bit: number) => apply((s) => ({ weekdays: s.weekdays ^ bit })),
  };
}
