// Opens the app's database on the phone (a file called novena.db) and makes sure every table exists.
// Everything the person does (novenas started, days prayed, saved novenas, reminders) is stored here.
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { createTablesSql } from './createTables';
import * as schema from './schema';

const sqlite = openDatabaseSync('novena.db');
sqlite.execSync(createTablesSql); // runs before any screen asks for data
export const db = drizzle(sqlite, { schema });
