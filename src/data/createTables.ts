// Creates the tables on first launch (safe to run every time).
// If a table changes later, add a new ALTER statement here instead of editing an old one.
export const createTablesSql = `
CREATE TABLE IF NOT EXISTS novena_run (
  id TEXT PRIMARY KEY NOT NULL,
  novena_id TEXT NOT NULL,
  started_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  paused_on TEXT,
  completed_on TEXT,
  removed_at INTEGER,
  restarted_from TEXT,
  cycle INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS day_completion (
  run_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  prayed_on TEXT NOT NULL,
  prayed_at INTEGER NOT NULL,
  prayed_late INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS day_completion_run_day ON day_completion (run_id, day);
CREATE TABLE IF NOT EXISTS saved_novena (
  novena_id TEXT PRIMARY KEY NOT NULL,
  saved_at INTEGER NOT NULL,
  removed_at INTEGER
);
CREATE TABLE IF NOT EXISTS intention (
  run_id TEXT PRIMARY KEY NOT NULL,
  text TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reminder_settings (
  id INTEGER PRIMARY KEY NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  time TEXT NOT NULL DEFAULT '20:00',
  weekdays INTEGER NOT NULL DEFAULT 127,
  missed_day_note INTEGER NOT NULL DEFAULT 1,
  feast_suggestions INTEGER NOT NULL DEFAULT 1,
  quiet_start TEXT NOT NULL DEFAULT '22:00',
  quiet_end TEXT NOT NULL DEFAULT '07:00'
);
CREATE TABLE IF NOT EXISTS novena_reminder_override (
  run_id TEXT PRIMARY KEY NOT NULL,
  enabled INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS download (
  novena_id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  bytes_done INTEGER NOT NULL DEFAULT 0,
  bytes_total INTEGER NOT NULL DEFAULT 0,
  content_version INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS playback_position (
  novena_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  position_sec INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS playback_position_novena_day ON playback_position (novena_id, day);
CREATE TABLE IF NOT EXISTS recent_search (
  query TEXT PRIMARY KEY NOT NULL,
  searched_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
