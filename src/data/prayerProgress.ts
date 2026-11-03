// Remembers where the person was in a prayer (day, scroll position, audio position), one record per novena run.
// It is stored on this phone only, in the small settings table. Saving progress never marks a day prayed or missed:
// prayed days live in their own table and are only written by "Mark Day N as prayed".
import { deleteMeta, getMeta, setMeta } from './queries';
import { parseProgress, type PrayerProgress } from '@/utils/pauseRules';

const key = (runId: string) => `prayer-progress-${runId}`;

export const getPrayerProgress = async (runId: string, day: number) => parseProgress(await getMeta(key(runId)), day);
export const savePrayerProgress = (runId: string, p: PrayerProgress) => setMeta(key(runId), JSON.stringify(p));
export const clearPrayerProgress = (runId: string) => deleteMeta(key(runId));
