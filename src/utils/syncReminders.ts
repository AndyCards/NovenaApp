// Re-plans all reminders from what is saved on the phone. It runs when the app opens, when the app
// comes back to the front, and after anything changes (a day prayed, a novena started or paused,
// a reminder setting changed). That way a reminder never rings for a day already prayed,
// and the two-week window of reminders keeps rolling forward.
import { addDaysTo, todayString } from './dateUtils';
import { feastOn, novenaStartFor } from './feasts';
import { rescheduleReminders } from './notifications';
import type { PlannedNotification } from './reminderPlanner';
import { REMINDER_WINDOW_DAYS } from '@/constants/config';
import type { Catalog } from '@/content/types';
import { getReminderSettings, listAllCompletions, listRuns } from '@/data/queries';

export async function syncReminders(catalog: Catalog) {
  const today = todayString();
  const [settings, runs, completions] = await Promise.all([getReminderSettings(), listRuns(), listAllCompletions()]);
  const active = runs
    .filter((r) => r.status === 'active')
    .map((r) => ({
      runId: r.id,
      novenaTitle: catalog.novenas.find((n) => n.id === r.novenaId)?.title ?? '',
      startedOn: r.startedOn,
      prayedDays: completions.filter((c) => c.runId === r.id).map((c) => c.day),
      remindersOn: true,
    }));

  // "Feast day novenas": on the day a saint's novena should begin (nine days before the feast),
  // send one note at the reminder time, unless that novena is already being prayed.
  const feastNotes: PlannedNotification[] = [];
  if (settings.enabled && settings.feastSuggestions) {
    const last = addDaysTo(today, REMINDER_WINDOW_DAYS - 1);
    const year = Number(today.slice(0, 4));
    for (const saint of catalog.saints) {
      const novena = catalog.novenas.find((n) => n.saintId === saint.id);
      if (!novena || runs.some((r) => r.novenaId === novena.id && r.status === 'active')) continue;
      for (const y of [year, year + 1]) {
        const start = novenaStartFor(saint, y);
        if (start < today || start > last) continue;
        feastNotes.push({ id: `feast:${saint.id}:${y}`, date: start, time: settings.time, kind: 'feast', runId: '', title: novena.title, day: 1,
          saintName: saint.name, feastDate: feastOn(saint, y) });
      }
    }
  }
  await rescheduleReminders(settings, active, today, feastNotes);
}
