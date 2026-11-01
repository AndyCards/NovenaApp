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
  gradient: {
    button: ['#575757', '#474747'], // dark CTA, top to bottom
    dark: ['#5F5F5F', '#3F3F3F'], // Figma Gradient/Dark: the pocketNovena wordmark, top to bottom
    iconCircle: ['#F1F1F1', '#FAFAFA'],
    // Figma Gradient/Audio Dock Fade: page content fades out behind the audio bar.
    audioDockFade: { colors: ['rgba(255,255,255,0.2)', '#FFFFFF', '#FFFFFF'], locations: [0.184, 0.39, 0.948] },
    imageScrim: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.82)'],
  },
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
