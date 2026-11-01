// Design tokens from the NovenaApp Figma file (Components page + variables).
// Neutral greys only, no accent colours. Page background is pure white.

export const colors = {
  surface: {
    page: '#FFFFFF',
    default: '#FFFFFF',
    raised: '#FBFBFB',
    subtle: '#EFEFEF',
    strong: '#E6E6E6',
  },
  text: {
    primary: '#3F3F3F',
    body: '#4F4F4F',
    secondary: '#5F5F5F',
    tertiary: '#6F6F6F',
    muted: '#9F9F9F', // decoration only, fails contrast for body text
    disabled: '#9F9F9F',
    onAction: '#FFFFFF',
  },
  border: {
    subtle: '#EFEFEF',
    default: '#D1D1D1',
    strong: '#9F9F9F',
    focus: '#2F2F2F',
  },
  action: {
    primary: '#4F4F4F',
    primaryHover: '#3F3F3F',
    primaryPressed: '#2F2F2F',
    secondary: '#EFEFEF',
    secondaryHover: '#E6E6E6',
    secondaryPressed: '#D9D9D9',
    selected: '#5F5F5F',
    disabled: '#D9D9D9',
    media: '#2F2F2F',
  },
  icon: { default: '#3F3F3F', secondary: '#6F6F6F' },
  progress: { track: '#D9D9D9', fill: '#5F5F5F' },
  overlay: { scrim: 'rgba(0,0,0,0.25)' },
  // Gradients live in `gradients` at the bottom of this file.
  glass: {
    nowPlayingFill: 'rgba(242,241,234,0.72)',
    nowPlayingBorder: 'rgba(255,255,255,0.9)',
    tabBarFill: 'rgba(255,254,252,0.72)',
    tabBarBorder: 'rgba(0,0,0,0.08)',
  },
} as const;

export const space = {
  2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 20: 20, 24: 24, 32: 32, 40: 40,
} as const;

// Screen side margins are always 10.
export const screenMargin = space[10];

export const radius = { xs: 5, s: 10, m: 18, l: 25, full: 999 } as const;

export const stroke = { hairline: 0.4, default: 1 } as const;

export const minTouchTarget = 44;

export const elevation = {
  level1: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  // Figma Elevation/Card: 0 0 4 #0000000D + 0 1 1 #0000000A
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
} as const;

export const blur = { glass: 24 } as const;

// Every gradient from the Figma design system ("Gradient/..." paint styles), ready to spread straight onto
// an expo-linear-gradient: <LinearGradient {...gradients.button} style={...} />.
// Each one runs top to bottom unless it says otherwise. `locations` are where each colour sits (0 = top, 1 = bottom).
// If a gradient changes in Figma, change it here and every screen that uses it follows.
type GradientSpec = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};
export const gradients = {
  // Gradient/Button: the dark "Start novena" / pray buttons.
  button: { colors: ['#575757', '#474747'] },
  // Gradient/Button Hover and Gradient/Button Pressed: the same button, darker while a finger is on it.
  buttonHover: { colors: ['#4B4B4B', '#3B3B3B'] },
  buttonPressed: { colors: ['#363636', '#282828'] },
  // Gradient/Dark: the pocketNovena wordmark in the top bar.
  dark: { colors: ['#5F5F5F', '#3F3F3F'] },
  // Gradient/Subtle: soft grey circles (Weekday Toggle off, the intention icon in the reader).
  subtle: { colors: ['#EFEFEF', '#FBFBFB'] },
  // Gradient/Icon Circle: the round icon behind each Intention Tile and empty-state icon.
  iconCircle: { colors: ['#F1F1F1', '#FAFAFA'] },
  // Gradient/Ornament: the two short lines either side of the cross under "Day 1 of 9".
  ornament: { colors: ['#5F5F5F', '#868484'] },
  // Gradient/Fade Top and Gradient/Fade Bottom: white edges so reader text fades out as it scrolls.
  fadeTop: { colors: ['#FFFFFF', 'rgba(255,255,255,0)'] },
  fadeBottom: { colors: ['rgba(255,255,255,0)', '#FFFFFF'] },
  // Gradient/Card Scrim: the dark wash over the bottom of the featured novena photos, so the white text reads.
  cardScrim: {
    colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.82)'],
    locations: [0, 0.3, 0.6, 0.85, 1],
  },
  // Gradient/Image Scrim: an older, stronger 3-step photo wash (kept to match Figma; not used on Page 34).
  imageScrim: { colors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)'], locations: [0, 0.55, 1] },
  // Gradient/Audio Bar Fade: white band behind the audio player in the reader. Faint at the very top,
  // fully white by about halfway down.
  audioBarFade: {
    colors: ['rgba(255,255,255,0.2)', '#FFFFFF', '#FFFFFF'],
    locations: [0, 0.52, 1],
    start: { x: 0.5, y: 0.04 },
    end: { x: 0.5, y: 1 },
  },
  // Gradient/Audio Dock Fade: the same idea for the floating player over Home and the novena page,
  // turning fully white sooner. (In Figma it leans very slightly; here it runs straight down.)
  audioDockFade: {
    colors: ['rgba(255,255,255,0.2)', '#FFFFFF', '#FFFFFF'],
    locations: [0, 0.27, 1],
    start: { x: 0.5, y: 0.15 },
    end: { x: 0.5, y: 1 },
  },
  // Gradient/Icon Dark: a dark grey fill seen once in Figma on a praying-hands icon. The app's icons are
  // single-colour, so this is kept for reference only.
  iconDark: { colors: ['#4F4F4F', '#686868', '#7C7C7C'], locations: [0, 0.51, 0.92] },
} as const satisfies Record<string, GradientSpec>;
