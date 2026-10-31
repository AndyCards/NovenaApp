// Page dots under a carousel. The active dot is an 18px pill.
import { View } from 'react-native';
import { colors } from '@/constants/theme';

const tones = {
  default: { on: colors.icon.secondary, off: colors.progress.track },
  strong: { on: colors.action.primaryPressed, off: colors.border.default },
} as const;

export function CarouselIndicator({ count, active, tone = 'default' }: { count: number; active: number; tone?: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <View accessible accessibilityLabel={`Page ${active} of ${count}`} style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: i + 1 === active ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i + 1 === active ? t.on : t.off }} />
      ))}
    </View>
  );
}
