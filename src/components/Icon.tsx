// Placeholder icons. The Figma file uses the outlined "Light" icon set (Phosphor Light).
// Replace the glyphs below with that set once the icon library is approved and installed.
import { Text } from 'react-native';
import { colors } from '@/constants/theme';

const glyphs = {
  back: '‹', close: '✕', more: '⋯', share: '↗', search: '⌕', check: '✓', chevronLeft: '‹', chevronRight: '›',
  play: '▶', pause: '❚❚', download: '↓', bookmark: '☐', bell: '◔', calendar: '▦', book: '▤', heart: '♡', clear: '✕',
} as const;
export type IconName = keyof typeof glyphs;

export function Icon({ name, size = 20, color = colors.icon.default }: { name: IconName; size?: number; color?: string }) {
  return <Text accessible={false} style={{ fontSize: size, color, lineHeight: size * 1.1 }}>{glyphs[name]}</Text>;
}
