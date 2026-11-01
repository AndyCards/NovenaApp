// Opens the app's database on the phone (a file called novena.db) and makes sure every table exists.
// Everything the person does (novenas started, days prayed, saved novenas, reminders) is stored here.
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { createTablesSql } from './createTables';
import * as schema from './schema';
import { RESET_USER_DATA } from '@/constants/config';

const sqlite = openDatabaseSync('novena.db');
sqlite.execSync(createTablesSql); // runs before any screen asks for data

// Testing aid: once per RESET_USER_DATA code, wipe what the person has done so the app looks like a first visit.
// Keeps downloaded audio and the content version, so nothing needs downloading again.
if (RESET_USER_DATA) {
  const done = sqlite.getFirstSync<{ value: string }>(`SELECT value FROM app_meta WHERE key = 'userDataResetCode'`);
  if (done?.value !== RESET_USER_DATA) {
    sqlite.withTransactionSync(() => {
      sqlite.execSync(`
        DELETE FROM day_completion; DELETE FROM intention; DELETE FROM novena_reminder_override;
        DELETE FROM playback_position; DELETE FROM novena_run; DELETE FROM saved_novena;
        DELETE FROM recent_search; DELETE FROM reminder_settings;
        DELETE FROM app_meta WHERE key <> 'contentVersion';`);
      sqlite.runSync(`INSERT INTO app_meta (key, value) VALUES ('userDataResetCode', ?)`, RESET_USER_DATA);
    });
  }
}
export const db = drizzle(sqlite, { schema });
