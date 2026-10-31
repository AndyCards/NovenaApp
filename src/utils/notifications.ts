// Applies the reminder plan to the phone's local notifications.
import * as Notifications from 'expo-notifications';
import { strings } from '@/copy/strings';
import { planReminders, type PlannedNotification, type PlannerRun, type PlannerSettings } from './reminderPlanner';

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function permissionGranted(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Clears and re-schedules the rolling window. Called by syncReminders (app open, app back in front, any change). */
export async function rescheduleReminders(settings: PlannerSettings, runs: PlannerRun[], today: string, extra: PlannedNotification[] = []) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await permissionGranted())) return;
  const planned: PlannedNotification[] = [...planReminders(settings, runs, today), ...extra].slice(0, 60);
  for (const p of planned) {
    const [h, m] = p.time.split(':').map(Number);
    const [y, mo, d] = p.date.split('-').map(Number);
    const when = new Date(y, mo - 1, d, h, m, 0);
    if (when.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: p.id,
      content: {
        title: p.kind === 'feast' ? strings.reminders.feastNotificationTitle(p.saintName ?? '') : strings.reminders.notificationTitle,
        body: p.kind === 'missed' ? strings.reminders.missedNotificationBody
          : p.kind === 'feast' ? strings.reminders.feastNotificationBody(p.title)
          : strings.reminders.notificationBody(p.title, p.day),
        data: { runId: p.runId, day: p.day },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}
