// Page dots under a carousel. The active dot is an 18px pill.
// Motion: as you swipe, the pill shrinks back to a dot and the next dot stretches into the pill.
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { duration, ease } from '@/motion/tokens';

const tones = {
  default: { on: colors.icon.secondary, off: colors.progress.track },
  strong: { on: colors.action.primaryPressed, off: colors.border.default },
} as const;

function Dot({ on, tone }: { on: boolean; tone: (typeof tones)[keyof typeof tones] }) {
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: duration.fade, easing: ease.out }); }, [on, p]);
  const style = useAnimatedStyle(() => ({ width: 6 + 12 * p.value, backgroundColor: interpolateColor(p.value, [0, 1], [tone.off, tone.on]) }));
  return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
}

export function CarouselIndicator({ count, active, tone = 'default' }: { count: number; active: number; tone?: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <View accessible accessibilityLabel={`Page ${active} of ${count}`} style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: count }, (_, i) => <Dot key={i} on={i + 1 === active} tone={t} />)}
    </View>
  );
}
