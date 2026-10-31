import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { createTablesSql } from './createTables';
import * as schema from './schema';

const sqlite = openDatabaseSync('novena.db');
sqlite.execSync(createTablesSql); // runs before any screen asks for data
export const db = drizzle(sqlite, { schema });
