# How the pocketNovena code is organised

A plain-English map of the folders. Every code file also starts with a comment saying what it does.

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
- `overlays/` pop-up cards and menus (always floating cards, never bottom sheets)
- `reader/` pieces of the prayer screen
- `audio/` the audio player
- `calendar/` calendar days and month cards

## src/motion/ — how things move
The app's animation rules live here so every screen moves the same way. `timing.ts` and `tokens.ts` hold the speeds and soft curves (calm, no bounce). `PressableScale` makes buttons and cards dip slightly under a finger. `Reveal` fades and slides page content in, one piece after another. `usePresence` lets pop-ups animate out before they disappear. `haptics.ts` adds three gentle touch cues. The full rules are in `docs/MOTION.md`. Everything runs on the phone's UI thread (react-native-reanimated) and switches itself off when iPhone's Reduce Motion setting is on.

## src/hooks/ — the "brains" behind screens
Small helpers that load data and do actions, so screens stay simple (e.g. `useLibrary`, `useAudio`, `useReminders`).

## src/data/ — what is stored on the phone
The database tables and the read/write helpers. Nothing here leaves the phone (intentions included).

## src/utils/ — rules and maths
Day rules (which day is due or missed), dates, feast days, search ranking, reminders planning, downloads, sharing.

## src/constants/ and src/copy/
Colours, spacing and fonts from Figma (`constants/`), and every sentence the app shows (`copy/strings.ts`). Change wording in `strings.ts`.

## assets/
Fonts, the bundled saint pictures, and `catalog.json` (the starter list of novenas, made from the Excel sheet).

## pipeline/
Tools that run on a computer, not in the app: turn the Excel sheet into `catalog.json`, prepare pictures, make audio, upload.

## tests/
Automatic checks that run on every change (GitHub "Tests").
