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

/** Clears and re-schedules the rolling window. Call on app open and whenever settings change. */
export async function rescheduleReminders(settings: PlannerSettings, runs: PlannerRun[], today: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await permissionGranted())) return;
  const planned: PlannedNotification[] = planReminders(settings, runs, today);
  for (const p of planned) {
    const [h, m] = p.time.split(':').map(Number);
    const [y, mo, d] = p.date.split('-').map(Number);
    const when = new Date(y, mo - 1, d, h, m, 0);
    if (when.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: p.id,
      content: { title: strings.reminders.notificationTitle, body: strings.reminders.notificationBody(p.title, p.day), data: { runId: p.runId, day: p.day } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}
