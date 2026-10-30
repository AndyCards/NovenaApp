# pocketNovena: what the app is made of

This page lists every screen in the app, then every building block used to make them.
"Building block" means a reusable piece, such as a button or a card. Use the same name everywhere it appears.

## Part 1: The screens

### Home (Discover)
- **First visit:** a welcome, a short "how a novena works" guide, and novenas grouped by feast days and collections.
- **Returning visit:** a "Continue praying" card showing where you left off, for example "Pray Day 4".
- **Searching:** a search box with suggestions as you type, results, and a "no results" message.
- **Search filters:** All, By intention, By saint, With audio.
- **No internet:** saved novenas only, with a short notice.
- **Couldn't load:** a message and a "Try again" button.

### Novena page
- One novena's name, saint, a short description, and its list of nine days.
- Buttons: "Start novena", "Pray Day N", or "Prayed Day N".
- Each day shows as prayed, today, missed, or coming up.
- Warnings: "You've missed 2 days" with buttons to continue or pray the missed days.
- When finished: a "Novena complete" card with "Pray it again" and "Share".

### Reader (the prayer itself)
- One day's prayer, with its intention and a "Mark Day N as prayed" button.
- A "View intention" option, where you can see or write your private intention.
- Listen or Read-only mode, and a menu for saving the novena or downloading audio.
- A player bar at the bottom while audio plays.
- Warnings: "Continue another time?" when you leave early.

### Library (your novenas)
- Three tabs: **Active**, **Completed**, and **Saved**.
- Each tab can be empty, with its own message and button.
- A "..." menu on each novena: pause, start again from Day 1, or remove.
- Confirmation cards for removing, restarting, or praying again, with an Undo message after removing.

### Reminders
- Set the daily prayer time and the days of the week.
- Settings for missed-day notes, feast-day reminders, and quiet hours.
- Turn reminders off for one novena.

### Calendar
- A month view showing prayed days and feast days.
- A year view.
- A list of feast days with the date each novena should start.

### Other
- **Day prayed:** a confirmation after praying, with a week view and a "Share today's prayer" button.
- **Share:** an image of a saint card or prayer to send to someone.
- **Settings:** not designed yet.

## Part 2: The building blocks

### Buttons and controls
- **Button:** the main action. Comes in large, medium and small sizes, as primary (dark) or secondary (light).
- **Icon button:** a round button with just a picture.
- **Close button:** the X in the corner of a card.
- **Back button:** returns to the previous screen.
- **Stepper button:** moves to the previous or next day.
- **Switch:** on or off.
- **Weekday toggle:** picks a day of the week for reminders.
- **Segmented control:** the Active / Completed / Saved tabs.
- **Filter chip:** a tappable label for search filters.
- **Recent chip:** a recent search.
- **Clear button:** empties a search box.

### Navigation
- **Tab bar:** the three buttons at the bottom: Library, Discover, Reminders.
- **Nav bar:** the strip at the top of each screen, with a title and back button.
- **Home app bar:** the top of the Home screen, which shrinks when you scroll.
- **Picker header:** the title row above a date or time picker.

### Cards and rows
- **Novena card:** a novena shown as a picture and name.
- **Featured novena card:** a larger card for a highlighted novena.
- **Novena row:** the same novena shown as a list item.
- **Continue card:** "Continue praying" on the Home screen.
- **Active / Completed novena card:** a novena in the Library.
- **Saved row:** a saved novena in the Library.
- **Search result row:** one search result.
- **Suggestion row:** one search suggestion.
- **Intention tile:** a tile for browsing by intention.
- **Intention card:** shows your private intention.
- **Saint avatar:** a small round picture of a saint.
- **Tag:** a small label such as "Grief".
- **Accordion:** a section you can open and close, such as "About this novena".
- **Feast row, feast date row, feast day item:** feast days in lists.
- **Carousel indicator:** the small dots showing which card you're on.
- **Section header:** the title above a group of items.

### Days and prayer text
- **Chapter title:** the heading for each day in the list.
- **Novena day row:** one day in the list, shown as prayed, today, missed, or coming up.
- **Day chip / day marker:** a small badge for a day's status.
- **Day picker:** choose a day from a list.
- **Prayer passage / prayer paragraph:** blocks of prayer text in the reader.
- **Prayer progress:** how many days are prayed.

### Pop-up cards
- **Popup card:** a card for pause, intention, or write-intention prompts.
- **Alert card:** a warning or confirmation, such as "You've missed 2 days" or "Remove this novena?"
- **Reminder note:** a short reminder message.
- **Reminder time card:** a card for setting a reminder time.
- **Toast:** a short message at the bottom, such as "Removed from Saved" with Undo.

### Menus
- **Reader options menu:** the menu inside the reader, with listen/read, save, and download.
- **Card menu:** the "..." menu on a Library card.
- **Menu option:** one row in a menu, with a pressed look.

### Audio
- **Now playing bar:** the player at the bottom. It has states for playing, paused, loading, finished, offline, error and hidden.
- **Audio player:** the full player, in a large or small version.
- **Audio dock:** the space that holds the player above the bottom of the phone.

### Calendar pieces
- **Calendar grid:** the month view.
- **Week row and weekday row:** the days of the week along the top.
- **Calendar cell / calendar day / calendar date:** one day in the calendar, shown as empty, prayed, today, a feast, or a novena start.
- **Month card:** one month in the year view.
- **Year day:** one day in the year view.

### Basics
- **Colours, text styles, spacing and corners:** the shared settings the rest of the app uses, so everything matches. These live in the design file, not on a screen.
- **Home indicator:** the bar at the bottom of an iPhone screen. It's a placeholder for layout only.

## Notes
- Names here match the design file's Components page, so developers and designers use the same words.
- Some components have placeholder names in Figma, such as "Type3" or "State7". They'll be renamed when we build them.
- Nothing here is final until you approve it.
