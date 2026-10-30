// Public settings only. Never put secrets here: everything in this file ships inside the app.

// Base address of the Cloudflare R2 bucket that holds catalog.json, version.json, images and audio.
export const CONTENT_BASE_URL =
  process.env.EXPO_PUBLIC_CONTENT_BASE_URL ?? 'https://content.example.com';

export const CATALOG_URL = `${CONTENT_BASE_URL}/catalog.json`;
export const VERSION_URL = `${CONTENT_BASE_URL}/version.json`;

export const audioUrl = (novenaId: string, day: number) =>
  `${CONTENT_BASE_URL}/audio/${novenaId}/day-${day}.m4a`;

export const imageUrl = (file: string) => `${CONTENT_BASE_URL}/images/${file}`;

// How often to look for new content while the app stays open.
export const CATALOG_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

// iOS keeps at most 64 pending local notifications, so reminders use a rolling window.
export const REMINDER_WINDOW_DAYS = 14;

export const NOVENA_LENGTH = 9;
export const RECENT_SEARCH_LIMIT = 10;
