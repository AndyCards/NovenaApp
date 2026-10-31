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
