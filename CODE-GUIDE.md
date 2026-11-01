# How the pocketNovena code is organised

A plain-English map of the folders. Every code file also starts with a comment saying what it does.

## The big picture, in four sentences
The app keeps everything on the phone: there are no accounts and nothing is sent anywhere. The list of novenas and their prayers comes bundled inside the app (`assets/catalog.json`), and the app quietly checks once a day for a newer list. What the person does (novenas started, days prayed, intentions, saved novenas, reminder settings) is stored in a small database on the phone. Whenever anything is saved, every screen and the reminders refresh themselves, so they always agree.

## app/ — the screens
Each file here is one screen. The file name is the screen's address.

| File | Screen |
|---|---|
| `app/(tabs)/index.tsx` | Home (the Discover tab) |
| `app/(tabs)/library.tsx` | Library: Active, Completed, Saved |
| `app/(tabs)/reminders.tsx` | Reminders |
| `app/(tabs)/_layout.tsx` | The three tabs at the bottom |
| `app/novena/[id].tsx` | A novena's page (picture, Pray button, nine days) |
| `app/reader/[runId]/[day].tsx` | The prayer for one day |
| `app/prayed/[runId]/[day].tsx` | "Day N marked as prayed" |
| `app/search.tsx` | Search |
| `app/calendar.tsx` | Calendar (month and year) |
| `app/share/[novenaId].tsx` | Share a saint card |
| `app/_layout.tsx` | Starts the app: fonts, content, then screens |

Square brackets mean "fill in": `novena/[id]` becomes `novena/st-anthony`.

## src/components/ — the building blocks
Buttons, cards, rows and pop-ups, each matching a component on the Figma Components page.
- `actions/` buttons
- `content/` cards, rows, pictures
- `inputs/` search box, switches, chips, tabs
- `navigation/` top bars and the tab bar
- `overlays/` pop-up cards and menus (always floating cards, never bottom sheets). `useRunMenu` is the "…" menu on a novena card (pause, resume, start again, remove), shared by Home and Library so both behave the same.
- `reader/` pieces of the prayer screen
- `audio/` the audio player
- `calendar/` calendar days and month cards

## src/motion/ — how things move
The app's animation rules live here so every screen moves the same way. `timing.ts` and `tokens.ts` hold the speeds and soft curves (calm, no bounce). `PressableScale` makes buttons and cards dip slightly under a finger. `Reveal` fades and slides page content in, one piece after another. `usePresence` animates pop-ups in (they close straight away, because iOS can freeze if a closing pop-up is still on screen while the next one opens or the app moves to another screen). `haptics.ts` adds four gentle touch cues: tap, confirm, warning (before removing something) and success (a day prayed). The full rules are in `docs/MOTION.md`. Everything runs on the phone's UI thread (react-native-reanimated) and switches itself off when iPhone's Reduce Motion setting is on.

## src/hooks/ — the "brains" behind screens
Small helpers that load data and do actions, so screens stay simple (e.g. `useLibrary`, `useAudio`, `useReminders`).

## src/state/ — shared memory while the app is open
`dataVersion.ts` is a counter that goes up whenever something is saved; screens watch it to know when to reload. `playerStore.ts` remembers what the audio player is doing, so every screen shows the same player.

## src/content/ — the shape of the novena list
`schema.ts` checks a downloaded novena list is complete before the app uses it (a broken list is ignored). `searchConcepts.ts` is the search "dictionary": it links everyday words (migraine, job, exams, marriage) to the saints and topics that fit, so search finds something useful even when no title matches.

## src/data/ — what is stored on the phone
The database tables and the read/write helpers. Nothing here leaves the phone (intentions included).

## src/utils/ — rules and maths
Day rules (which day is due or missed), dates, feast days, search ranking, reminders planning, downloads, sharing.

## src/constants/ and src/copy/
Colours, spacing and fonts from Figma (`constants/`), and every sentence the app shows (`copy/strings.ts`). Change wording in `strings.ts`.

**Testing switches in `constants/config.ts` (turn off before release):**
- `PLACEHOLDER_AUDIO = true` plays a bundled sample tone instead of real recordings.
- `DUMMY_INTENTIONS = true` fills in a sample intention the first time a novena is opened.
- The prayers in `assets/catalog.json` are sample text until the real prayers are added.

## assets/
Fonts, the bundled saint pictures, and `catalog.json` (the starter list of novenas, made from the Excel sheet).

## pipeline/
Tools that run on a computer, not in the app: turn the Excel sheet into `catalog.json`, prepare pictures, make audio, upload.

## tests/
Automatic checks that run on every change (GitHub "Tests"): the day rules, reminder planning, search ranking and the search dictionary, and the novena list checker.

## How to check the code is healthy
Run these in the project folder. All three should finish without errors.
- `npx tsc --noEmit` checks the code for mistakes in how pieces fit together.
- `npx jest` runs the automatic tests.
- `npx expo export --platform ios` builds the app the way the phone would load it.

These don't replace trying the app on the phone: animations, haptics, notifications and audio can only be judged on a real device.
