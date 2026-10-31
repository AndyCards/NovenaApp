// Public settings only. Never put secrets here: everything in this file ships inside the app.

// Base address of the Cloudflare R2 bucket that holds catalog.json, version.json, images and audio.
export const CONTENT_BASE_URL =
  process.env.EXPO_PUBLIC_CONTENT_BASE_URL ?? 'https://content.example.com';

export const CATALOG_URL = `${CONTENT_BASE_URL}/catalog.json`;
export const VERSION_URL = `${CONTENT_BASE_URL}/version.json`;

// TEMPORARY: while real recordings don't exist yet, every day plays one short placeholder tone (assets/audio/placeholder-prayer.mp3,
// made for this app, so no licence worries) and the audio bar shows on the Reader. Set to false when real audio is ready.
export const PLACEHOLDER_AUDIO = true;

export const audioUrl = (novenaId: string, day: number) =>
  `${CONTENT_BASE_URL}/audio/${novenaId}/day-${day}.m4a`;

export const imageUrl = (file: string) => `${CONTENT_BASE_URL}/images/${file}`;

// How often to look for new content while the app stays open.
export const CATALOG_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

// iOS keeps at most 64 pending local notifications, so reminders use a rolling window.
export const REMINDER_WINDOW_DAYS = 14;

export const NOVENA_LENGTH = 9;
export const RECENT_SEARCH_LIMIT = 10;

// TEMPORARY, for testing: the first time you open a novena's Reader, a sample intention is saved for it (you can still edit or clear it).
// Set to false once testing is done.
export const DUMMY_INTENTIONS = true;
export const DUMMY_INTENTION_TEXTS = [
  'Calm before my exams, and the patience to wait on God\u2019s answer.',
  'Healing and strength for my mother, and peace for our whole family.',
  'Guidance in my work, and the courage to make a hard decision well.',
  'Gratitude for what I have, and trust for what is still unknown.',
];
