// Settings for the database tool (Drizzle). It tells the tool where the table definitions live.
// Only used by developers; the app itself never reads this file.
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/data/schema.ts',
  out: './src/data/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
