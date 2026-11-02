# UX Designer's Guide to the pocketNovena code

This guide is for someone who knows screens, flows, components and design systems, but not software engineering. It explains where each thing you see in the app lives in the code, what you can change safely, and what to leave alone.

`CODE-GUIDE.md` is the short folder map. This guide goes deeper. Every code file also starts with a plain-English comment saying what it does, so open any file and read the top few lines first.

---

## 1. How the app works, in plain language

- **Everything stays on the phone.** There are no accounts, no logins and no server that stores anything about the person. Intentions never leave the phone.
- **The novenas come bundled inside the app.** Their titles, pictures, prayers for each of the nine days, tags and categories live in one file, `assets/catalog.json`. That file is made from an Excel sheet by a tool in `pipeline/`. Once a day the app checks whether a newer list has been published and quietly swaps it in. Right now the publishing address is a placeholder, so in practice the bundled list is always used.
- **What the person does is saved in a small database on the phone.** That covers novenas started, days prayed, intentions, saved novenas, reminder settings and recent searches. The file is `novena.db`, and the code for it is in `src/data/`.
- **The screens stay in step by themselves.** Whenever something is saved, a counter goes up (`src/state/dataVersion.ts`). Every screen that shows that data watches the counter and reloads. That's why marking a day as prayed updates Home, the Library and the novena page straight away, and why the reminders re-plan themselves.

### Words used in the code that you'll see a lot

| Word in the code | What it means in the app |
|---|---|
| **novena** | One novena from the list (St Anthony, St Jude…). Its content is the same for everyone. |
| **run** | One time the person prays a novena. Tapping *Start Novena* creates a run. *Pray it again* creates a second run of the same novena. A run has a status: `active`, `paused`, `completed` or `quit`. |
| **day / dayNo** | Day 1 to 9 of a run. |
| **catalog** | The full list of novenas, saints, categories and Home sections. |
| **prayedDays** | The day numbers of a run already marked as prayed. |
| **preview** | Reading a day of a novena you haven't started. It is read only and nothing is saved. |
| **collection** | A Home section, such as "All-time Favorites". |

---

## 2. Project structure

```
app/                ← the screens. One file = one screen. The file name is the screen's address.
  _layout.tsx       ← starts the app: loads fonts, the novena list, then shows screens + the floating audio bar
  (tabs)/           ← the three screens with the bottom tab bar
    _layout.tsx     ← the tab bar itself: Library · Discover · Reminders
    index.tsx       ← Home (the "Discover" tab)
    library.tsx     ← Library: Active / Completed / Saved
    reminders.tsx   ← Reminders settings
  novena/[id].tsx   ← a novena's page (picture, Start/Pray button, list of nine days)
  reader/[runId]/[day].tsx   ← the prayer for one day (the Reader)
  prayed/[runId]/[day].tsx   ← "Day N marked as prayed"
  search.tsx        ← Search
  calendar.tsx      ← Calendar (month and year views)
  share/[novenaId].tsx       ← Share a saint card as a picture
  settings.tsx      ← placeholder, not designed yet

src/
  components/       ← the building blocks (buttons, cards, rows, pop-ups). Mirrors the Figma Components page.
  constants/        ← design tokens: colours, spacing, radius, shadows (theme.ts), type styles (typography.ts), test switches (config.ts)
  copy/strings.ts   ← every sentence the app shows
  motion/           ← how things move: speeds, curves, press feedback, haptics
  hooks/            ← the "brains" behind screens: load data, do actions
  state/            ← shared memory while the app is open (audio player state, "something changed" counter)
  data/             ← the on-phone database: tables and read/write helpers
  utils/            ← rules and maths: day rules, dates, feasts, search ranking, reminder planning
  content/          ← the shape of the novena list, the search dictionary, test narration

assets/             ← fonts, saint pictures, the logo, catalog.json, sample audio
pipeline/           ← tools that run on a computer, not in the app (Excel → catalog.json, pictures, audio)
tests/              ← automatic checks of the rules (day rules, search, reminders, motion numbers)
docs/MOTION.md      ← the full motion rules
```

**Square brackets in a file name mean "fill in".** `novena/[id].tsx` is the screen at `/novena/st-anthony`, `/novena/st-jude`, and so on. `reader/[runId]/[day].tsx` is `/reader/<the run's id>/3` for Day 3.

### How the files connect

```
Screen (app/…)  ──uses──▶  Components (src/components/…)  ──style from──▶  Tokens (src/constants/theme.ts, typography.ts)
      │                                                                     Words (src/copy/strings.ts)
      │                                                                     Motion (src/motion/…)
      └──asks──▶  Hooks (src/hooks/…)  ──read/write──▶  Database helpers (src/data/queries.ts)
                         │
                         └──apply rules from──▶  src/utils/ (e.g. dayRules.ts: which day is due or missed)
```

A screen never talks to the database directly. It asks a hook, for example `useLibrary()` for "give me my novenas" or `lib.pause(runId)` for "pause this one". The hook uses the helpers in `src/data/queries.ts`, then bumps the "something changed" counter so every screen refreshes.

### Files a UX designer will touch most

| To change… | Open |
|---|---|
| A colour, spacing, corner radius, shadow, blur | `src/constants/theme.ts` |
| A font size, weight or line height | `src/constants/typography.ts` |
| Any wording on screen | `src/copy/strings.ts` (a few one-off labels sit inside the screen file itself) |
| How a component looks (card, button, row) | the component in `src/components/…` |
| What appears on a screen, and in what order | the screen in `app/…` |
| Animation speed or softness | `src/motion/tokens.ts` (see `docs/MOTION.md`) |
| Icons | `src/components/Icon.tsx` (Phosphor "Light" icons) |
| Saint pictures, logo | `assets/images/` |

---

## 3. Screen by screen

Each screen names the Figma frame it matches (Page 34) in its first comment.

### Home (the Discover tab): `app/(tabs)/index.tsx`
- **What the person sees.** A first-time user sees *All-time Favorites* (portrait cards), *How a novena works*, *Feast days ahead*, then the other sections from the catalog. A returning user is someone with at least one novena in progress, active or paused. They see the big featured carousel with *Start Novena*, then *Continue praying* cards, *What are you praying for?* tiles, feast days, then the other sections.
- **How it decides.** `returning = active.length > 0`, where `active` holds the novenas that are active or paused. A paused novena keeps its Continue card, with the eyebrow "Paused" and a **Resume** button (Andy, 2026-11-02).
- **Top bar.** `HomeAppBar` (logo, Calendar button, Search button), made of frosted glass, with the page scrolling underneath.
- **Taps.**
  - A novena card opens its page (`/novena/<id>`).
  - *Start Novena* on a featured card starts the novena, or picks up the existing one, and opens today's prayer.
  - *Pray Day N* on a Continue card opens that day in the Reader. *Resume* on a paused card picks the novena up again first.
  - "…" on a Continue card opens the menu (Pause, Start again from Day 1, Remove). That menu is `useRunMenu`, the same one the Library uses.
  - A *What are you praying for?* tile opens Search filtered to that need.
  - A feast-day saint opens their novena, or the Calendar if they have none.
- **Movement.** The featured carousel moves on by itself every 4 seconds and pauses for 8 seconds after a finger touches it. Sections fade and slide in one after another (`Reveal`).
- **Sections come from the catalog** (`catalog.collections`), in the order set in the spreadsheet. You can re-theme Home from the Excel sheet without touching code.

### Novena page: `app/novena/[id].tsx`
- **What the person sees.** The big saint picture (cropped from the top so heads stay in view), the title, a meta row (minutes per day and tags), the action bar (Save bookmark and the dark pray button), the description, then *Novena Days*, which folds open and shut.
- **The pray button's label depends on the run.**
  - No run yet: **Start Novena**.
  - Days were missed: **Continue with Day N**.
  - Otherwise: **Pray Day N**.
- **Day rows** show a marker for prayed, today, missed or upcoming (`DayMarker`). If the novena isn't started, tapping a day opens it in **preview**. Only the big button starts a novena.
- **The Share icon** at the top right opens the Share screen.

### Reader: `app/reader/[runId]/[day].tsx`
- **What the person sees.** *Day N of 9* with a cross ornament (`ChapterTitle`), the prayer in Source Serif (`PrayerPassage`), the *View Intention* card where the prayer pauses for an intention, and the **Mark Day N as prayed** button. When audio is open, the player card sits at the bottom.
- **Pop-ups.** Only one shows at a time, controlled by one value, `popup`:
  - `'menu'`: the … options menu (`ReaderOptionsMenu`)
  - `'intention-edit'`: the *Your Intention* writing card
  - `'intention-view'`: shows the intention you wrote
  - `'pause'`: *Continue another time?*
  - `'none'`: nothing open
- **First visit to a new novena.** After a short pause (0.6 s) the *Your Intention* card opens once by itself. Each run has its own intention.
- **Intention saving.** The intention saves itself while you type (0.4 s after you stop). Tapping *Add Intention* or ✕ saves too. With an empty box, *Add Intention* just puts the cursor in it.
- **Mark as prayed.**
  - It is disabled when the day is already prayed (the label becomes *Prayed Day N*).
  - It is also disabled when the day isn't due yet ("upcoming"). Days follow the calendar: Day N is due N−1 days after the start. A short line under the button then says when it can be marked ("You can mark Day 2 as prayed tomorrow.").
  - A double tap counts once. After it, the screen is replaced by "Day N marked as prayed".
- **Back.**
  - If today's day isn't prayed, Back asks *Continue another time?* (*Leave and resume later* or *Keep praying*).
  - If the day is prayed, or this is a preview, Back just goes back.
- **Preview mode.** The address starts with `preview~`. It is read only: no Mark button (*Start Novena* instead), no intention card, and nothing is saved.
- **Audio.** It never starts by itself. While placeholder audio is on (`PLACEHOLDER_AUDIO` in `config.ts`), the player opens paused for each day. While it plays, the sentence being spoken gets a sand-coloured marker (`colors.surface.reading`) and the page scrolls gently to keep it in view (`useFollowAlong`).

### Reader options menu: `src/components/overlays/ReaderOptionsMenu.tsx`
- A floating card under the … button. It has a day stepper (‹ Day N of 9 ›), **Prayer mode** (Listen / Read only), then *Save to My Novenas*, *Download for offline*, *Share this novena* and *View intention*.
- *Download* is greyed out with "Audio coming soon" while a novena has no recordings (all of them, today).
- The menu stays open while you switch Listen / Read only. It closes when you tap outside it.

### Day prayed: `app/prayed/[runId]/[day].tsx`
- A strip of five days around the one just prayed (dark = prayed, dashed = not), *Day N marked as prayed*, a calm line, a reminder note (*Want a gentle reminder tomorrow? Set*, or *We will gently remind you tomorrow at 8:00 PM. Change*), and *Share today's prayer*.
- After Day 9 the reminder note is hidden and the dots fill in one after another.
- ✕ goes to the novena's page. If that page is already underneath, it goes back to it rather than opening a second copy.

### Library: `app/(tabs)/library.tsx`
- **Segmented control** with three tabs: Active (with a count), Completed and Saved.
- **Active:** `ActiveNovenaCard` for each active or paused novena. If today's day is already prayed, the button turns light with a tick and opens the novena page instead of the Reader. The card shows *Paused* when paused.
- **Completed:** `CompletedNovenaCard` with dates and *Pray it again*, which asks first.
- **Saved:** one card listing `SavedRow`s. Tapping the bookmark unsaves, with *Undo*.
- **Empty states** for each tab, each with a button (*Find a novena*, *See active novenas*, *Browse novenas*).
- **"…" menu:** Pause or Resume, Start again from Day 1, Remove novena. Remove asks *Remove this novena?* and then shows *Novena removed · Undo*. Removing only hides the novena; Undo brings it back exactly as it was.

### Search: `app/search.tsx`
- **Before typing:** filter chips (All · By intention · By saint · With audio), *Popular searches* chips and *Browse by intention* tiles.
- **While typing:** recent searches as chips, *Suggestions* (up to 3, with the typed part in bold), *Explore related novenas* and the intention tiles.
- **After pressing search** (or tapping a suggestion or chip): "N novenas for '…'", the results, and *Related novenas*.
- **No exact match:** a friendly recovery screen with *Novenas that may help* (found through the search dictionary, so "migraine" finds St Dymphna), *Try searching for* chips, and *Or browse by intention*.
- The ranking rules are in `src/utils/searchRank.ts`. The dictionary of everyday words is in `src/content/searchConcepts.ts`. You can edit that dictionary safely to improve results.

### Reminders: `app/(tabs)/reminders.tsx`
- **Card 1:** Daily prayer time switch, Time (tap to open the time picker, `ReminderSheet`) and Repeat on (seven weekday circles).
- **Card 2 (Extras):** *If I miss a day*, *Feast day novenas* and *Quiet hours*.
- A grey note appears when the phone has refused notifications. A warning appears when the chosen time falls in quiet hours.
- Turning reminders on asks the phone for permission. If the answer is no, the switch stays off.

### Calendar: `app/calendar.tsx`
- **Month view:** a month card with saint pictures on feast days, then this month's feasts as rows.
- The button at the top right switches to the **year view** (twelve small months). Tapping a month goes back to it.

### Share: `app/share/[novenaId].tsx`
- A saint card (picture, title, tagline) that is turned into a picture when *Share* is tapped. Intentions are never included.

### Settings: `app/settings.tsx`
- A placeholder that says "Settings are not designed yet."

---

## 4. Component reference

All components are in `src/components/`, grouped like the Figma Components page. The first comment in each file names the Figma component and its key measurements.

### Actions (`actions/`)
| Component | Where it appears | What it does / how to customise |
|---|---|---|
| `Button` | Reader (Mark as prayed), pop-ups, Share, Day prayed | Big pill (50 high). `variant` is `primary` (dark gradient) or `secondary` (light grey). `size` is default 50, medium 44 or small 34. `disabled` greys it out. It dips slightly under a finger. Colours come from `colors.gradient.button` and `colors.action.*`. |
| `ActionBar` | Novena page | Round Save bookmark plus the dark pray button. |
| `PrayButton` | Home Continue card | Small dark pill, "Pray Day 4", with praying hands. |
| `IconButton` | Nav bars, menus | A round icon-only button. It always has a spoken label for VoiceOver. |
| `StepperButton` | Reader menu | The ‹ › arrows that change the day. |

### Content (`content/`)
| Component | Where | Notes |
|---|---|---|
| `NovenaCard` | Home sections | Portrait picture, title, tagline. |
| `FeaturedNovenaCard` | Home carousel | Full-bleed picture, dark scrim, white text, glass *Start Novena* button. |
| `ContinueCard` | Home, *Continue praying* | Picture, "DAY N OF 9" (or "PAUSED"), title, *Pray Day N* / *Continue with Day N* / *Resume*, "…" menu. |
| `ActiveNovenaCard` | Library Active | Like the Continue card, with a light button and a prayed-today tick. |
| `CompletedNovenaCard` | Library Completed | Dates and *Pray it again*. |
| `SavedRow` | Library Saved | Bookmark to unsave. |
| `SearchResultRow` | Search results | 88×104 picture, title, line, tag. |
| `NovenaRow` | Home "list" sections | Tall picture row. |
| `NovenaImage` | Everywhere a saint picture shows | Always crops from the top centre so heads are never cut off. |
| `SaintAvatar` | Feast days, calendar | Round picture, or the saint's initials if there is no picture. |
| `FeastDayItem` / `FeastDateRow` | Home feast row / Calendar list | |
| `IntentionTile` | Home, Search | Icon circle and label, two per row. |
| `HowItWorksCard` | Home (first time) | The three steps. |
| `SectionHeader` | Home | Heading plus an optional *See all*. |
| `NovenaMetaRow`, `DurationLabel`, `Pill` | Novena page, rows | Minutes and tag pills. |
| `CarouselIndicator` | Under carousels | Dots. The active one is a pill that stretches as you swipe. |

### Inputs (`inputs/`)
`SearchField`, `FilterChip`, `RecentChip`, `SuggestionRow`, `SegmentedControl` + `Segment` (Library tabs), `Switch`, `WeekdayToggle`, `SettingRow` (Reminders rows), `WheelPicker` (time wheel).

### Navigation (`navigation/`)
- `TabBar` + `TabItem`: the glass bottom bar. The active tab gets a soft pill and a filled icon.
- `NavBar`: the top bar on inner screens (Back, optional title, up to two actions). With `overlay` it floats over the page. With `scrolled` it shows a soft shadow once the page has moved.
- `HomeAppBar`: Home's top bar.
- All three use `GlassSurface` (`src/components/GlassSurface.tsx`), the shared frosted glass. If iOS "Reduce Transparency" is on, it becomes solid.

### Overlays (`overlays/`)
Pop-ups are always **floating cards, never bottom sheets** (Andy's rule).
- `FloatingCard`: the shared shell. Dark backdrop, round ✕ above a white card, rises in softly. The ✕ has three looks: `raised`, `plain` and `soft`.
- `PopupCard`: the Reader pop-ups: *Continue another time?*, *Your Intention* (write) and *Your Intention* (view).
- `AlertCard`: confirmations. Today only *Remove this novena?* and *Pray it again?* are opened, from the "…" menus and the Completed tab. The card also has "You've missed N days" and "Novena complete" versions, but no screen opens them yet.
- `CardMenu`: the small "…" menu under a card. `useRunMenu` wires it up for Home.
- `ReaderOptionsMenu`: the Reader … menu.
- `ReminderSheet`: the time picker card.
- `Toast`: a short message with *Undo* that disappears by itself.
- `ReminderNote`: the grey info note.

### Reader (`reader/`)
`ChapterTitle` (Day N of 9 and the cross), `PrayerPassage` (lays out the day's paragraphs and the intention card), `PrayerParagraph` (one paragraph with the follow-along marker), `NovenaDayRow` + `DayMarker` (the day list on the novena page).

### Audio (`audio/`)
- `AudioPlayer`: the player card. It shows a thumbnail, title, status ("Playing · 1:08 left"), play/pause, ✕ and a draggable scrubber. Tapping the title shows or hides the scrubber.
- `AudioDock`: places the player card.
- `GlobalAudioDock`: keeps the small player on every page while audio is open. It sits above the tab bar on tab pages, and is hidden on the Reader, Day prayed and Share screens so it never covers their main button.

### Not used on any screen right now
These exist but nothing shows them. Changing them has no visible effect: `ClearButton`, `NovenaDetailPicButton`, `IntentionCard`, `StepRow`, `MenuOption`, `MenuRow`, `DayChip`, `DayStepper`.

---

## 5. Important interactions and flows

### Starting and praying a novena
1. A novena page shows **Start Novena**. Tapping it creates a run with today as its start date (`useRuns().start`). A quick double tap only creates one.
2. The Reader opens Day 1 and offers the intention card once.
3. **Mark Day 1 as prayed** saves the day (`markPrayed` in `src/hooks/useMarkPrayed.ts`), gives a gentle success haptic and shows *Day 1 marked as prayed*.
4. Home now shows the *Continue praying* card.

### Day rules (`src/utils/dayRules.ts`)
These are pure logic, with no screens, and are covered by tests in `tests/dayRules.test.ts`.
- **Due date:** Day N is due on the start date + (N−1) days.
- **Missed:** a past day not prayed is **missed**. *Continue* moves to today's day ("Continue with Day 5").
- **Reading ahead:** reading a later day does **not** mark it as prayed. Upcoming days can be read but not marked.
- **Completion:** praying Day 9 completes the novena. Missed days don't block it.
- **What Continue opens:** today's day, or, if today's is already prayed, the next unprayed day (which may not be due yet).

### Pause, resume, remove, start again
- **Pause / Resume** change the run's status. A paused novena shows *Paused* on its card in the Library and on Home, and no reminders ring for it.
- **Remove** hides the run (`softRemoveRun`). *Undo* restores it exactly, still paused if it was paused. Prayed days stay in history.
- **Start again / Pray it again** ends the old run and creates a new one from Day 1 (round 2, 3…).

### Navigation
- **The screen stack.** Inner screens slide in from the right and can be swiped back. The Day prayed screen fades in because it *replaces* the Reader.
- **The three tabs.** Back on a tab returns to Home (`backBehavior="initialRoute"` in `app/(tabs)/_layout.tsx`).
- **Commands used to move between screens:**
  - `router.push('/novena/st-jude')` opens a screen on top.
  - `router.replace(...)` swaps the current screen.
  - `router.back()` goes back.
  - `router.dismissTo(...)` goes back to a screen if it's already underneath.

### Reminders
`src/components/ReminderSync.tsx` is invisible. Whenever anything is saved, and whenever the app comes to the front, it re-plans the phone's local notifications for the next 14 days (`src/utils/syncReminders.ts`, `reminderPlanner.ts`). Reminders skip days already prayed and respect weekdays and quiet hours.

---

## 6. Finding and changing visual styles

### Colours: `src/constants/theme.ts`
The tokens are named like the Figma styles:
- `colors.surface.*`: backgrounds. The page is pure white.
- `colors.text.*`: text greys, from `primary` (darkest) to `tertiary`. `muted` is for decoration only and is too light for reading.
- `colors.border.*`, `colors.action.*` (button fills for each state), `colors.icon.*` and `colors.progress.*`.
- `colors.gradient.*`: the dark button gradient, wordmark and image scrim.
- `colors.glass.*`: tab bar and player glass.

The palette is neutral greys only, with no accent colours (Andy's rule).

**Example.** To make every dark button slightly lighter, change `colors.gradient.button`. Every primary `Button`, `ActionBar` and `PrayButton` follows.

### Spacing, corners, lines, shadows (also `theme.ts`)
- `space`: the spacing scale.
- `screenMargin`: always 10 at the screen edges.
- `radius`: `xs` 5, `s` 10, `m` 18, `l` 25, `full`.
- `stroke.hairline`: 0.4.
- `elevation.card`: the soft card shadow.
- `blur.glass`: glass blur strength.
- `tabBar`: tab bar heights.

### Type: `src/constants/typography.ts`
- `type.*` are named text styles, for example `type.titleMedium` (Figtree SemiBold 16/21) and `type.readerProse` (Source Serif 17/24).
- Figtree is used everywhere. Source Serif is used **only** on Reader screens.
- To change a style everywhere, change it here. To change one place, find where the screen or component uses `type.something`.

### Inline values
Some measurements sit right in the component, for example `width: 104, height: 130` for card art or `height: 403` for the novena picture. They are written next to their Figma comment. Changing them affects only that component.

### Icons: `src/components/Icon.tsx`
A list of names mapped to Phosphor "Light" icons. To add one, add a name to the list and use `<Icon name="…" />`.

### Motion: `src/motion/tokens.ts`
Durations, curves and press amounts. The rule is calm and quick, with no bounce. All motion switches off with iOS Reduce Motion. See `docs/MOTION.md`.

---

## 7. Understanding UI states

| State | How the code shows it | Where |
|---|---|---|
| **Loading** | Most screens show nothing (`return null`) for the split second until data is read from the phone. Home waits for `loaded` before choosing first-time or returning, so it never flashes the wrong layout. | Home, Reader |
| **Empty** | The Library tabs have their own empty states (title, body, button). Search has the "no exact match" recovery screen. | `library.tsx` (`Empty`), `search.tsx` |
| **Disabled** | `Button disabled` turns grey and can't be tapped. Examples: Mark as prayed on a day not due yet; Download while there is no audio; the stepper arrows on Day 1 and Day 9. | `Button.tsx`, `ReaderOptionsMenu.tsx` |
| **Selected / active** | Filter chips go dark. The Library segment slides a white pill under the chosen tab. The active tab has a pill and a filled icon. | `FilterChip`, `SegmentedControl`, `TabItem` |
| **Pressed** | `PressableScale` makes things dip slightly (and dim, for buttons) while touched. | `src/motion/PressableScale.tsx` |
| **Success** | The *Day N marked as prayed* screen and a success haptic. Toasts confirm removals, with Undo. | `prayed/…`, `Toast` |
| **Error** | Audio errors show in the player card ("offline" / "error" states). A broken downloaded novena list is ignored, and the last good one is kept. | `AudioPlayer`, `catalogSync.ts` |
| **Audio player** | `hidden` (not shown), `loading`, `paused`, `playing`, `finished`, `offline`, `error`. | `src/state/playerStore.ts` |
| **Day markers** | `prayed` (solid), `today` (soft disc), `missed` (dashed dark ring), `upcoming` (dashed light ring). | `DayMarker.tsx`, `dayRules.ts` |
| **Pop-up open / closed** | One `popup` value per screen, or `visible` on the card. Pop-ups rise in, and close instantly by design so iOS doesn't freeze when one closes while the next opens. | Reader, `FloatingCard`, `usePresence` |

---

## 8. Safe areas for UX changes (and what needs care)

| Category | Safe to change | Files |
|---|---|---|
| **Visual styling** (colours, type, spacing, borders, shadows, sizes) | ✅ Yes. This is the safest area. | `theme.ts`, `typography.ts`, the `style={…}` parts of components |
| **Wording** | ✅ Yes. | `src/copy/strings.ts` |
| **UI structure** (order of sections, what's inside a card) | ✅ Mostly. Move the JSX blocks (the `<View>…</View>` pieces) around inside a screen file. Keep the `onPress` attached to the same element. | `app/…`, `src/components/…` |
| **Interaction behaviour** (taps, navigation, pop-ups, animation) | ⚠️ With care. Changing *where* a button goes (`router.push(...)`) is easy. Changing *when* a pop-up opens can clash with other pop-ups, because only one shows at a time. | screen files, `src/motion/` |
| **Application logic** (day rules, saving, search ranking, reminders) | ⛔ Only with a developer, or after reading the tests. These decide what is saved and when reminders ring. | `src/utils/`, `src/hooks/`, `src/data/` |
| **Outside services** (content download, audio files) | ⛔ Leave alone. The addresses are placeholders. | `src/constants/config.ts`, `src/utils/catalogSync.ts`, `src/utils/downloads.ts`, `pipeline/` |

### Files that need extra care
- `src/data/createTables.ts` and `src/data/schema.ts`: the database layout. Editing an existing table can lose people's saved data. New columns are added with a new statement instead.
- `src/data/queries.ts`: every save goes through here. Writes must be **awaited**. A write that isn't awaited silently does nothing (this caused the lost-intention bug fixed on 2026-11-02).
- `src/utils/dayRules.ts`: Andy's day rules. These are tested in `tests/dayRules.test.ts`.
- `src/state/dataVersion.ts`: the "something changed" counter. Every save must call `dataChanged()` or screens won't update.
- `src/hooks/useAudio.ts`: the one audio player. The rule is that audio never autoplays.
- `src/constants/config.ts`: testing switches that must be turned off before release: `PLACEHOLDER_AUDIO`, `DUMMY_INTENTIONS`. Changing them changes app behaviour.
- `app/_layout.tsx` and `app/(tabs)/_layout.tsx`: start-up and tabs. A mistake here stops the whole app.
- `src/content/schema.ts`: checks a downloaded novena list. Loosening it can let broken content in.

### Checking your change didn't break anything
Run these in the project folder:
- `npx tsc --noEmit` checks that the pieces still fit.
- `npx jest` runs the automatic tests.

Then try it on the phone with Expo Go.

---

## 9. Glossary

| Term | Plain meaning |
|---|---|
| **Component** | A reusable building block, like a Figma component. A `.tsx` file that draws part of the screen. |
| **Screen / route** | A whole page. Its file name in `app/` is its address. |
| **Props** | A component's settings, like Figma variant properties. `<Button label="Save" variant="secondary" />` sets two props. |
| **State** (`useState`) | Something a screen remembers while it's open, like which pop-up is showing or what's typed in a box. When it changes, the screen redraws. |
| **Hook** (`useSomething`) | A helper that gives a screen data or abilities, for example `useLibrary()` gives the novenas and the actions to pause, save and so on. |
| **Effect** (`useEffect`) | "When this appears or changes, do that." For example, load the saved intention when the Reader opens. |
| **JSX** | The HTML-like tags in `.tsx` files (`<View>`, `<Text>`) that describe the layout. `View` is a frame, and `Text` is a text layer. |
| **style** | The visual properties of a layer: `padding`, `gap`, `borderRadius`, `backgroundColor`… These are like Figma's auto-layout and fill panels. `flexDirection: 'row'` is horizontal auto-layout, and `gap` is spacing between items. |
| **Pressable / onPress** | Something tappable, and what happens when it's tapped. |
| **Modal** | A layer drawn above everything else, used by the pop-up cards. |
| **Navigation / router** | Moving between screens. `push` opens a screen on top, `back` goes back, `replace` swaps the current screen. |
| **Database** | The small file on the phone where the person's progress is stored. |
| **Await** | "Wait for this to finish." Saves must be awaited. |
| **Catalog** | The list of novenas and their content (`assets/catalog.json`). |
| **Run** | One time someone prays a particular novena. |
| **Token** | A named design value (a colour, size or speed) used everywhere instead of a raw number. |
| **Reanimated** | The animation library. It runs animations smoothly on the phone's UI thread. |
| **Haptics** | Gentle vibrations on a tap or a success. |
| **Expo / Expo Go** | The toolkit the app is built with, and the phone app used to try it without the App Store. |
| **TypeScript (`.ts`, `.tsx`)** | JavaScript with labels on every value, so mistakes are caught before the app runs. |
| **Test** | An automatic check that a rule still works, in `tests/`. |
| **PR (pull request)** | A proposed change on GitHub that can be reviewed before it's merged. |
