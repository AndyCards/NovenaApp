// Figtree everywhere. Source Serif 4 only for prayer text and the day
// heading on Reader screens. No other fonts.
import type { TextStyle } from 'react-native';

export const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  readerRegular: 'SourceSerif4_400Regular',
  readerSemibold: 'SourceSerif4_600SemiBold',
} as const;

const style = (fontFamily: string, fontSize: number, lineHeight: number): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
});

export const type = {
  headingH1: style(fonts.bold, 24, 31),
  headingH2: style(fonts.bold, 20, 26),
  titleDialog: style(fonts.bold, 18, 26),
  titleCard: style(fonts.semibold, 18, 24),
  titleQuote: style(fonts.semibold, 18, 22),
  titleSection: style(fonts.semibold, 16, 23),
  titleMedium: style(fonts.semibold, 16, 21),
  titleSmall: style(fonts.semibold, 15, 21),
  bodyLarge: style(fonts.regular, 15, 22),
  bodyInput: style(fonts.regular, 16, 22), // text typed into the intention box (Figma 985:35413)
  bodyCard: style(fonts.regular, 15, 19.5),
  bodyMedium: style(fonts.regular, 14, 19),
  bodySmall: style(fonts.regular, 12, 16),
  labelLarge: style(fonts.semibold, 18, 23),
  labelMedium: style(fonts.medium, 15, 22),
  labelChip: style(fonts.medium, 15, 18),
  labelSmall: style(fonts.medium, 14, 18),
  labelCaption: style(fonts.semibold, 12, 16),
  labelTab: style(fonts.medium, 12, 16),
  labelTabActive: style(fonts.semibold, 12, 16),
  labelEyebrow: style(fonts.regular, 12, 13),
  labelEyebrowCaps: { ...style(fonts.regular, 12, 16), textTransform: 'uppercase' },
  labelXSmall: style(fonts.regular, 10, 13),
  calendarDay: style(fonts.medium, 16, 21),
  calendarMonth: style(fonts.semibold, 13, 21),
  calendarWeekday: style(fonts.regular, 13, 21), // weekday names above the month grid (Mon, Tue ...)
  calendarYearDay: style(fonts.medium, 10, 13),
  calendarYearWeekday: style(fonts.bold, 10, 13),
  sharePrayer: style(fonts.regular, 15, 20),
  wordmark: style(fonts.semibold, 20, 26),
  wordmarkSmall: style(fonts.semibold, 14, 18),
  // Reader screens only.
  readerDayHeading: style(fonts.readerSemibold, 22, 31),
  readerProse: style(fonts.readerRegular, 17, 24), // never smaller
} as const satisfies Record<string, TextStyle>;
