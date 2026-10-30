# Novena App: Implementation Plan

Status: plan only, nothing built. Based on the Oct 27 blueprint (`/mnt/project-files/pocket-novena-blueprint/CLAUDE.md`) and the decisions made on Oct 30. The plain-English list of screens and components is in `TAXONOMY.md` next to this file.

---

## Tech stack

- **App:** React Native with Expo and TypeScript. One codebase for iPhone and Android (development build, not Expo Go).
- **Navigation:** Expo Router. Bottom tabs: Library, Discover, Reminders. Other screens open on top.
- **Phone storage:** expo-sqlite with Drizzle (progress, library, intentions, reminders, downloads).
- **Content:** Excel sheet converted to `catalog.json`, checked with Zod. Hosted on Cloudflare R2 so new novenas and prayers arrive without an app update.
- **Images:** expo-image. Small thumbnails bundled in the app; full-size WebP on R2, cached after first view.
- **Audio:** prayers generated ahead of time with Kokoro or Piper (open source text-to-speech), stored as `.m4a` on R2. Playback with expo-audio, or react-native-track-player if lock-screen controls need it.
- **Reminders:** expo-notifications, local only. No push server.
- **Other:** expo-font (Figtree, plus Source Serif 4 for the Reader), expo-blur (glass bars), date-fns, react-native-view-shot and expo-sharing, Zustand for the audio player.
- **Accounts:** none. **Backup:** the phone's own (iCloud backup, Android Auto Backup).
- **Testing and CI:** Jest, Maestro, GitHub Actions.
- **Running cost:** $0/month (R2 free tier). Apple Developer $99/year, Google Play $25 once.

---

## Architecture overview

```
YOUR COMPUTER                                   CLOUDFLARE R2 (free)
Excel sheet ──script──▶ catalog.json ─────────▶ catalog.json + version.json
Kokoro / Piper ───────▶ day-N.m4a ────────────▶ audio/<novenaId>/day-N.m4a
Image script ─────────▶ thumb + full WebP ────▶ images/<novenaId>-full.webp
                                                      │  read-only, no user data
PHONE (iPhone / Android)                              ▼
Screens (Expo Router)
  └─ Feature hooks (src/features)
       ├─ Domain rules: dayRules · feasts · reminderPlanner · search
       ├─ Content store ◀── Catalog sync (check version, validate, swap)
       │     starts from the bundled catalog, so it works offline
       ├─ SQLite: runs · day completions · saved · intentions · reminders · downloads
       ├─ Audio player: streams from R2 or plays a downloaded file
       └─ Local notifications (rolling 14-day window)
```

Rules:
- User data (progress, intentions, reminders) stays on the phone and never goes to a server.
- On app open, and once a day, the app downloads `version.json`. If the number is higher, it downloads the new catalog, validates it, and swaps it in. If validation fails it keeps the last good copy.
- The app never needs an update to show new novenas or prayers. It needs one only for new features or screen changes.

---

## Data model

### Excel sheet (source of truth for content), four tabs

**Novenas** (one row per novena, up to 90)
- `id` (short, never changes once published, e.g. `st-anthony`), `title`, `saint_id`
- `tagline` (e.g. "For work & employment"), `about` (the paragraph on the Novena page), `minutes_per_day`
- `tags` (Grief, Lost Articles…), `categories` (for "What are you praying for?"), `keywords` (so "anxiety" finds the right novenas)
- `image_file`, `image_focus` (default top-center), `has_audio`, `audio_size_mb`
- `featured`, `order`, `published` (yes/no, hides drafts)

**Days** (one row per day, about 9 per novena)
- `novena_id`, `day` (1–9), `day_title`
- `prayer_text`, with markers inside the text: `[intention]` (the "take a moment for what you hold in prayer" moment), `[silence N]`, `[pause N]` (seconds, used by the audio script)
- `share_quote` (optional line for "Share today's prayer"), `audio_file` (optional)

**Saints:** `id`, `name`, `avatar_image`, `feast_date` (MM-DD), `patron_of`. A novena can have no saint (Surrender, Divine Mercy).

**Collections / Categories / Search suggestions:** the Home sections ("Popular among Catholics", "All-time Favorites", "Patron Saints for Mental Health"), the intention groups, and related search terms.

Derived, not stored: novena start date = feast date minus 9 days.

### catalog.json (generated from the sheet)
Manifest `{ version, minAppVersion, novenas[], saints[], categories[], collections[], feasts[] }`. Each novena carries its days as ordered blocks: opening, prayer, intention, silence, closing.

### On the phone (SQLite)
- `novena_run`: `id`, `novena_id`, `started_on`, `status` (active / paused / completed / quit), `paused_on`, `removed_at`, `restarted_from`, `cycle`
- `day_completion`: `run_id`, `day`, `prayed_on`, `prayed_late` (unique per run and day)
- `saved_novena`: `novena_id`, `saved_at`, `removed_at` (for the Undo toast)
- `intention`: `run_id`, `text`
- `reminder_settings`: enabled, time, weekdays, missed-day note, feast-day reminders, quiet hours
- `novena_reminder_override`: `run_id`, enabled (the "turn off for this novena" switch)
- `download`, `playback_position`, `recent_search`, `app_meta` (prayer mode: listen or read only, schema and content versions)
- Missed days are calculated from `started_on`, never stored. Ids never change. Migrations are only added, never edited.

---

## Project structure

```
novena-app/
├── app/                               routes only (Expo Router)
│   ├── _layout.tsx                    fonts, providers, catalog sync on open
│   ├── (tabs)/
│   │   ├── _layout.tsx                glass tab bar
│   │   ├── index.tsx                  Discover
│   │   ├── library.tsx                Active / Completed / Saved
│   │   └── reminders.tsx
│   ├── novena/[id].tsx                Novena page
│   ├── reader/[runId]/[day].tsx       Reader
│   ├── search.tsx
│   ├── calendar.tsx
│   ├── share/[novenaId].tsx
│   └── settings.tsx                   placeholder (not designed yet)
├── src/
│   ├── design/
│   │   ├── tokens.ts                  colours, spacing, corners, type (from Figma)
│   │   └── components/                one file per Figma component, same names
│   ├── features/
│   │   ├── discover/                  sections built from collections and categories
│   │   ├── novena/                    Start / Pray Day N / Prayed states
│   │   ├── reader/                    reading, mark as prayed
│   │   ├── library/                   tabs, pause, restart, remove, undo
│   │   ├── audio/                     player store, downloads
│   │   ├── reminders/                 settings, permission moment
│   │   ├── calendar/                  month, year, feasts
│   │   ├── search/                    suggestions, filters, recents
│   │   └── share/                     share image
│   ├── domain/                        plain logic, fully tested
│   │   ├── dayRules.ts                due day, missed, completion
│   │   ├── feasts.ts                  feast dates, start = feast − 9 days
│   │   ├── reminderPlanner.ts         schedules the next 14 days
│   │   └── search.ts                  ranking, keywords, accents
│   ├── content/
│   │   ├── schema.ts                  Zod checks for catalog.json
│   │   ├── catalogStore.ts            current catalog in memory
│   │   └── catalogSync.ts             version check, download, validate, swap
│   ├── db/                            schema, migrations, queries
│   ├── lib/
│   │   ├── network.ts                 online / offline status
│   │   ├── toast.tsx                  one place for the Toast (with Undo)
│   │   └── alerts.tsx                 one place for the Alert Cards
│   └── copy/strings.ts                all screen text in one place
├── assets/                            fonts, bundled thumbnails, starter catalog.json
├── pipeline/                          runs on your computer, not in the app
│   ├── novenas.xlsx
│   ├── excel-to-json.ts
│   ├── validate.ts                    every saint, collection and category id exists
│   ├── tts.py                         Kokoro / Piper with [pause N] markers
│   ├── images.ts                      PNG → WebP thumb + full
│   └── upload.ts                      pushes files to R2
├── tests/                             unit tests, Maestro flows
├── TAXONOMY.md
└── app.config.ts                      public base URL only, no secrets
```

---

## UI specifications (from the Figma Components page and styles)

### Colour (neutral only, no accent colours)
| Token | Value | Use |
|---|---|---|
| Surface/Page | #FFFFFF | Screen background (pure white) |
| Surface/Default | #FFFFFF | Cards |
| Surface/Raised | #FBFBFB | Raised cards |
| Surface/Subtle · Strong | #EFEFEF · #E6E6E6 | Fills, pressed areas |
| Text/Primary · Body · Secondary · Tertiary | #3F3F3F · #4F4F4F · #5F5F5F · #6F6F6F | Text levels |
| Text/Muted · Disabled | #9F9F9F | Decoration only |
| Text/On Action | #FFFFFF | Text on dark buttons |
| Border/Subtle · Default · Strong · Focus | #EFEFEF · #D1D1D1 · #9F9F9F · #2F2F2F | Lines and focus ring |
| Action/Primary · Hover · Pressed | #4F4F4F · #3F3F3F · #2F2F2F | Dark buttons |
| Action/Secondary · Hover · Pressed | #EFEFEF · #E6E6E6 · #D9D9D9 | Light buttons |
| Action/Selected · Disabled | #5F5F5F · #D9D9D9 | Selected chips, disabled |
| Action/Media | #2F2F2F | Audio controls |
| Icon/Default · Secondary | #3F3F3F · #6F6F6F | Icons |
| Progress/Track · Fill | #D9D9D9 · #5F5F5F | Progress |
| Overlay/Scrim | #000000 at 25% | Behind floating cards |

### Typography
Figtree everywhere. The only exception is Source Serif 4 for prayer text and the day heading on Reader screens. No Mulish or Poppins.

| Style | Font | Size / line |
|---|---|---|
| Heading H1 · H2 | Figtree Bold | 24/31 · 20/26 |
| Reader day heading | Source Serif 4 SemiBold | 22/31 (Reader only) |
| Title card · quote | Figtree SemiBold | 18/24 · 18/22 |
| Title section · medium · small | Figtree SemiBold | 16/23 · 16/21 · 15/21 |
| Reader prayer text | Source Serif 4 Regular | 17/24 (Reader only, never smaller) |
| Body large · card · medium · small | Figtree Regular | 15/22 · 15/130% · 14/19 · 12/16 |
| Share prayer text | Figtree Regular | 15/135% |
| Label large | Figtree SemiBold | 18/23 |
| Label medium · chip · small | Figtree Medium | 15/22 · 15/18 · 14/18 |
| Label caption · tab active | Figtree SemiBold | 12/16 · 12 |
| Label tab | Figtree Medium | 12 |
| Eyebrow · eyebrow caps · tiny | Figtree Regular | 12/13 · 12/16 · 10/13 |
| Calendar day · year day · year weekday | Figtree Medium / Bold | 16/21 · 10 · 10 |
| Calendar month | Figtree SemiBold | 13/21 |
| Wordmark · small | Figtree SemiBold | 20 · 14 |

### Spacing, corners, lines, effects
- **Spacing steps:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40. Screen side margins always 10.
- **Corners:** 5, 10, 18, 25, fully round. **Lines:** hairline 0.4, standard 1.
- **Shadows:** Elevation/1 and Elevation/Card.
- **Glass:** Now Playing Bar (#F2F1EA at 72%, white 90% border) and Tab Bar (#FFFEFC at 72%, black 8% border). Falls back to a solid fill when Reduce Transparency is on.

### Rules
- Dark button: 50pt tall, no shadow. States: Default, Hover, Pressed, Focus, Disabled.
- Pop-ups are floating cards inset 10pt, with a Close button top right. Never bottom sheets (the Figma "Reminder Sheet" should be built as a floating card).
- Images are cropped from the top centre so heads are never cut off.
- Touch targets at least 44 × 44pt. All text scales with the phone's text-size setting; reader prose never below 17pt.
- Player bar: shows on the Reader and Novena page once audio has started; first state Paused; never autoplays; swipe back keeps it playing; drag down closes it.
- Tab order: Library, Discover, Reminders. Discover is the default.
- Day prayed card shows a five-day week strip ending in "Today".
- Search filters use Filter Chip (All, By intention, By saint, With audio).
- Light appearance only until dark mode is designed.

---

## Key interactions

1. **Start a novena:** Discover → novena card → Novena page → Start → Reader Day 1 → Mark as prayed → Day prayed card → Continue card on Discover.
2. **Daily prayer:** reminder → Reader opens at today's day → pray → Mark as prayed.
3. **Missed day:** open after a gap → "You've missed N days" → Continue with today's day, or pray the missed days.
4. **Listen:** Reader → Play (never autoplays) → player bar → lock-screen controls → Download for offline.
5. **New content:** you edit the sheet → publish to R2 → the app finds a new version on open → new novena appears.
6. **Finish:** Day 9 → Novena complete → Library Completed → Pray it again.
7. **Manage:** Library "..." menu → pause, start again from Day 1, or remove (confirmation card, then Undo message).

---

## Build steps

1. Write TAXONOMY.md
2. Set up the Expo project with TypeScript and a development build for iOS and Android
3. Generate design tokens from Figma (colours, spacing, corners, type)
4. Base components: Button, Nav Bar, Tab Bar, Floating Card
5. Excel → `catalog.json` pipeline with validation and 3 real novenas
6. Phone database, migrations and day rules, with tests
7. Catalog sync from R2 with fallback to the last good copy
8. Discover (first visit, returning, Continue card)
9. Novena page (Chapter title, day rows, missed-days alert)
10. Reader, Mark as prayed, missed days, Day prayed card
11. Library (Active / Completed / Saved, menu, Undo)
12. Generate TTS audio for one novena; player bar and downloads
13. Reminders with the permission moment and a rolling 14-day schedule
14. Calendar and feast days
15. Search and Share
16. Accessibility, offline and release checks on iPhone and Android

---

## Not designed yet

Audio loading, error and download-failed states; the notification permission screens and "notifications off" banner; calendar empty month and tapping a day; editing or deleting an intention; Settings; large-text and iPhone SE layouts.

## Open questions for Andy

1. While a novena is paused, do days still count as missed, or does the calendar freeze?
2. Should shared prayers (the same opening each day) be reused, or written out for each day?
3. Can one saint have more than one novena?
4. Some Figma variant names are placeholders (Type3, State7, Variant2, Size3) and need real names.
