// Read and write helpers. Screens never touch the database directly; hooks call these.
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from './db';
import {
  appMeta, dayCompletion, download, intention, novenaRun, recentSearch,
  reminderSettings, savedNovena,
} from './schema';
import { RECENT_SEARCH_LIMIT } from '@/constants/config';

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

// ---- runs ----
export const listRuns = () => db.select().from(novenaRun).where(isNull(novenaRun.removedAt)).orderBy(desc(novenaRun.createdAt));

export async function startRun(novenaId: string, startedOn: string, restartedFrom?: string) {
  const id = uuid();
  const cycle = restartedFrom ? ((await db.select().from(novenaRun).where(eq(novenaRun.id, restartedFrom)))[0]?.cycle ?? 0) + 1 : 1;
  await db.insert(novenaRun).values({ id, novenaId, startedOn, status: 'active', restartedFrom, cycle, createdAt: Date.now() });
  return id;
}

export const setRunStatus = (runId: string, status: 'active' | 'paused' | 'completed' | 'quit', today: string) =>
  db.update(novenaRun).set({
    status,
    pausedOn: status === 'paused' ? today : null,
    completedOn: status === 'completed' ? today : null,
  }).where(eq(novenaRun.id, runId));

export const softRemoveRun = (runId: string) => db.update(novenaRun).set({ removedAt: Date.now(), status: 'quit' }).where(eq(novenaRun.id, runId));
export const undoRemoveRun = (runId: string) => db.update(novenaRun).set({ removedAt: null, status: 'active' }).where(eq(novenaRun.id, runId));

// ---- days prayed ----
export const listCompletions = (runId: string) => db.select().from(dayCompletion).where(eq(dayCompletion.runId, runId));
export const listAllCompletions = () => db.select().from(dayCompletion);

export const markDayPrayed = (runId: string, day: number, prayedOn: string, prayedLate: boolean) =>
  db.insert(dayCompletion).values({ runId, day, prayedOn, prayedAt: Date.now(), prayedLate }).onConflictDoNothing();

// ---- saved ----
export const listSaved = () => db.select().from(savedNovena).where(isNull(savedNovena.removedAt)).orderBy(desc(savedNovena.savedAt));
export const saveNovena = (novenaId: string) =>
  db.insert(savedNovena).values({ novenaId, savedAt: Date.now() }).onConflictDoUpdate({ target: savedNovena.novenaId, set: { savedAt: Date.now(), removedAt: null } });
export const unsaveNovena = (novenaId: string) => db.update(savedNovena).set({ removedAt: Date.now() }).where(eq(savedNovena.novenaId, novenaId));
export const undoUnsave = (novenaId: string) => db.update(savedNovena).set({ removedAt: null }).where(eq(savedNovena.novenaId, novenaId));

// ---- intentions (private) ----
export const getIntention = async (runId: string) => (await db.select().from(intention).where(eq(intention.runId, runId)))[0]?.text ?? '';
export const setIntention = (runId: string, text: string) =>
  db.insert(intention).values({ runId, text, updatedAt: Date.now() }).onConflictDoUpdate({ target: intention.runId, set: { text, updatedAt: Date.now() } });
export const deleteIntention = (runId: string) => db.delete(intention).where(eq(intention.runId, runId));

// ---- reminders ----
export async function getReminderSettings() {
  const row = (await db.select().from(reminderSettings).where(eq(reminderSettings.id, 1)))[0];
  if (row) return row;
  await db.insert(reminderSettings).values({ id: 1 });
  return (await db.select().from(reminderSettings).where(eq(reminderSettings.id, 1)))[0];
}
export const saveReminderSettings = (patch: Partial<typeof reminderSettings.$inferInsert>) =>
  db.update(reminderSettings).set(patch).where(eq(reminderSettings.id, 1));

// ---- downloads ----
export const getDownload = async (novenaId: string) => (await db.select().from(download).where(eq(download.novenaId, novenaId)))[0];
export const saveDownload = (row: typeof download.$inferInsert) =>
  db.insert(download).values(row).onConflictDoUpdate({ target: download.novenaId, set: row });
export const deleteDownload = (novenaId: string) => db.delete(download).where(eq(download.novenaId, novenaId));

// ---- recent searches ----
export const listRecentSearches = () => db.select().from(recentSearch).orderBy(desc(recentSearch.searchedAt)).limit(RECENT_SEARCH_LIMIT);
export async function addRecentSearch(query: string) {
  await db.insert(recentSearch).values({ query, searchedAt: Date.now() }).onConflictDoUpdate({ target: recentSearch.query, set: { searchedAt: Date.now() } });
}
export const clearRecentSearches = () => db.delete(recentSearch);
export const deleteRecentSearch = (query: string) => db.delete(recentSearch).where(eq(recentSearch.query, query));

// ---- small settings (prayer mode, content version) ----
export const getMeta = async (key: string) => (await db.select().from(appMeta).where(eq(appMeta.key, key)))[0]?.value;
export const setMeta = (key: string, value: string) =>
  db.insert(appMeta).values({ key, value }).onConflictDoUpdate({ target: appMeta.key, set: { value } });

export const activeRunsFor = (novenaId: string) =>
  db.select().from(novenaRun).where(and(eq(novenaRun.novenaId, novenaId), eq(novenaRun.status, 'active'), isNull(novenaRun.removedAt)));
