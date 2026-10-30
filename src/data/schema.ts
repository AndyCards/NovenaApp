// Tables kept on the phone. Nothing here ever leaves the device.
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const novenaRun = sqliteTable('novena_run', {
  id: text('id').primaryKey(), // uuid
  novenaId: text('novena_id').notNull(),
  startedOn: text('started_on').notNull(), // YYYY-MM-DD, local date
  status: text('status', { enum: ['active', 'paused', 'completed', 'quit'] }).notNull().default('active'),
  pausedOn: text('paused_on'),
  completedOn: text('completed_on'),
  removedAt: integer('removed_at'), // soft delete so Undo works
  restartedFrom: text('restarted_from'),
  cycle: integer('cycle').notNull().default(1),
  createdAt: integer('created_at').notNull(),
});

export const dayCompletion = sqliteTable(
  'day_completion',
  {
    runId: text('run_id').notNull(),
    day: integer('day').notNull(),
    prayedOn: text('prayed_on').notNull(), // YYYY-MM-DD, local date
    prayedAt: integer('prayed_at').notNull(),
    prayedLate: integer('prayed_late', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => ({ unique: uniqueIndex('day_completion_run_day').on(t.runId, t.day) }),
);

export const savedNovena = sqliteTable('saved_novena', {
  novenaId: text('novena_id').primaryKey(),
  savedAt: integer('saved_at').notNull(),
  removedAt: integer('removed_at'),
});

export const intention = sqliteTable('intention', {
  runId: text('run_id').primaryKey(),
  text: text('text').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const reminderSettings = sqliteTable('reminder_settings', {
  id: integer('id').primaryKey(), // always 1
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  time: text('time').notNull().default('20:00'), // HH:mm
  weekdays: integer('weekdays').notNull().default(127), // bitmask, Sun = 1
  missedDayNote: integer('missed_day_note', { mode: 'boolean' }).notNull().default(true),
  feastSuggestions: integer('feast_suggestions', { mode: 'boolean' }).notNull().default(true),
  quietStart: text('quiet_start').notNull().default('22:00'),
  quietEnd: text('quiet_end').notNull().default('07:00'),
});

export const novenaReminderOverride = sqliteTable('novena_reminder_override', {
  runId: text('run_id').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
});

export const download = sqliteTable('download', {
  novenaId: text('novena_id').primaryKey(),
  status: text('status', { enum: ['queued', 'downloading', 'complete', 'failed'] }).notNull(),
  bytesDone: integer('bytes_done').notNull().default(0),
  bytesTotal: integer('bytes_total').notNull().default(0),
  contentVersion: integer('content_version').notNull().default(0),
});

export const playbackPosition = sqliteTable(
  'playback_position',
  {
    novenaId: text('novena_id').notNull(),
    day: integer('day').notNull(),
    positionSec: integer('position_sec').notNull(),
  },
  (t) => ({ unique: uniqueIndex('playback_position_novena_day').on(t.novenaId, t.day) }),
);

export const recentSearch = sqliteTable('recent_search', {
  query: text('query').primaryKey(),
  searchedAt: integer('searched_at').notNull(),
});

export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
