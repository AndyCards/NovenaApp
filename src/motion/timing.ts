// Plain numbers for the motion language (no animation library needed, so they are easy to test).

// How long things take, in milliseconds.
export const duration = {
  press: 90, // finger down on a button
  quick: 150, // switches, chips, small colour changes
  fade: 200, // things appearing or leaving
  reveal: 260, // page content sliding up
  sheetIn: 340, // cards rising in
  sheetOut: 200, // cards leaving (always faster than coming in)
};

// Page content slides up by this many points while fading in.
export const revealDistance = 12;
// Delay between neighbours in a staggered list, and the most neighbours that get a delay (so long lists don't crawl).
export const staggerStep = 45;
export const staggerMax = 6;

// How long to wait before the Nth item of a list appears. Pure maths, so it is easy to test.
export const staggerDelay = (index: number) => Math.min(Math.max(index, 0), staggerMax) * staggerStep;

// How far a button shrinks while a finger is on it.
export const pressScale = { button: 0.97, card: 0.985, icon: 0.92 };
