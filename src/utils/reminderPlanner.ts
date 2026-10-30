// Plans which local notifications to schedule. iOS allows ~64 pending, so we plan a rolling window.
import { addDaysTo } from './dateUtils';
import { REMINDER_WINDOW_DAYS } from '@/constants/config';

export interface PlannerSettings {
  enabled: boolean;
  time: string; // HH:mm
  weekdays: number; // bitmask, Sunday = bit 0
  missedDayNote: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface PlannerRun {
  runId: string;
  novenaTitle: string;
  startedOn: string;
  prayedDays: number[];
  remindersOn: boolean; // per-novena switch
}

export interface PlannedNotification {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  kind: 'daily' | 'missed';
  runId: string;
  title: string;
  day: number;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Is this time inside quiet hours (which may wrap past midnight)? */
export function inQuietHours(time: string, start: string, end: string) {
  const t = toMinutes(time), s = toMinutes(start), e = toMinutes(end);
  return s <= e ? t >= s && t < e : t >= s || t < e;
}

export function planReminders(
  settings: PlannerSettings,
  runs: PlannerRun[],
  today: string,
  maxPending = 60,
): PlannedNotification[] {
  if (!settings.enabled) return [];
  const out: PlannedNotification[] = [];
  for (let offset = 0; offset < REMINDER_WINDOW_DAYS; offset++) {
    const date = addDaysTo(today, offset);
    const weekday = new Date(`${date}T12:00:00`).getDay();
    if (!(settings.weekdays & (1 << weekday))) continue;
    if (inQuietHours(settings.time, settings.quietStart, settings.quietEnd)) continue;
    for (const run of runs) {
      if (!run.remindersOn) continue;
      const dayNumber = Math.round((new Date(`${date}T12:00:00`).getTime() - new Date(`${run.startedOn}T12:00:00`).getTime()) / 86400000) + 1;
      if (dayNumber < 1 || dayNumber > 9) continue;
      if (run.prayedDays.includes(dayNumber)) continue;
      out.push({ id: `${run.runId}:${date}:daily`, date, time: settings.time, kind: 'daily', runId: run.runId, title: run.novenaTitle, day: dayNumber });
    }
  }
  return out.slice(0, maxPending);
}
