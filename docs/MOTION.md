# pocketNovena motion system

Calm, natural, quiet. No bounce, no particles, nothing that interrupts prayer. All code lives in `src/motion/`.

| Thing | Rule | Where |
|---|---|---|
| Speeds | press 90ms, quick 150, fade 200, reveal 260, sheet in 340, sheet out 200 | `timing.ts` |
| Curves | out (0,0,0.2,1) enter, in (0.4,0,1,1) leave, push (0.2,0.8,0.2,1), sheet (0.32,0.72,0,1) | `tokens.ts` |
| Soft landing | `settle` (340ms, sheet curve) for switches, pills, menus. Timed, not a physics spring, so it is identical on every phone | `tokens.ts` |
| Press feedback | buttons shrink to 97%, cards 98.5%, icons 92%; ease back in 180ms | `PressableScale.tsx` |
| Page content | fade up 12pt, 45ms apart, at most 6 steps | `Reveal.tsx` |
| Pop-ups and menus | backdrop fades, card rises and settles; leaves faster | `usePresence.ts` |
| Success cue | the item swells 18% and settles (saving a novena) | `usePulse.ts` |
| Day prayed | the day circle fills quietly after the page appears, with one soft success haptic | `app/prayed/...` |
| Haptics | `tap` (switches, tabs, segments, save), `confirm` (Start novena), `success` (day prayed) | `haptics.ts` |
| Screens | native iOS push and swipe-back; tabs cross-fade; "day prayed" fades | `app/_layout.tsx`, `app/(tabs)/_layout.tsx` |
| Reduce Motion | movement is skipped (fades only); animations declare `ReduceMotion.System` | everywhere |

Not in this app (so nothing to animate): streak counters, loading spinners, plan comparison.

## Priority interactions (Andy, 2026-11-01)
1. **Daily prayer completion:** on "Day N marked as prayed" the day circle fills in quietly after the page appears (and the nine circles fill one after another on the last day). Library and Home update through the shared data counter.
2. **Opening a novena:** the card dips under the finger, the screen pushes in with the native iOS slide, and the saint picture settles in from slightly smaller (`Reveal fromScale`). A true shared-element picture hand-off is not used: it is not reliable in Expo Go.
3. **Audio player:** play and pause icons cross-fade, the bar glides between updates and follows the finger, the knob grows while held, and tapping the title folds or opens the progress bar.
4. **Calendar:** each month card glides in from the side you are moving towards; completed days fade in. No streak counters or scores.
5. **Navigation and pop-ups:** native push and swipe back, soft fades for pop-ups, and the light haptics in `haptics.ts`. Timed soft curves are used instead of springs, because springs did not show reliably on device.

## Audio bar fold and prayer mode switch
- Tapping the player title folds or opens the progress bar: the card height glides over 320 ms (soft in-out) while the bar fades and drifts 8 pt. It works the same in the Reader and in the floating bar.
- Listen / Read only in the reader's "…" menu: a white pill slides between the two (280 ms, soft in-out) and the label colours cross-fade. The menu waits for the slide to finish before closing.
