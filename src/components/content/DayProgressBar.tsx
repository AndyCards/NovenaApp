// A thin progress line for a novena being prayed: "3 of 9 days prayed". The fill grows smoothly when a day is added.
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { duration, ease } from '@/motion/tokens';

export function DayProgressBar({ prayed, total }: { prayed: number; total: number }) {
  const p = useSharedValue(0);
  const fraction = total > 0 ? Math.min(1, prayed / total) : 0;
  useEffect(() => { p.value = withDelay(200, withTiming(fraction, { duration: duration.sheetIn * 1.5, easing: ease.sheet })); }, [fraction, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`${prayed} of ${total} days prayed`} accessibilityValue={{ min: 0, max: total, now: prayed }} style={{ gap: 6 }}>
      <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{`${prayed} of ${total} days prayed`}</Text>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.progress.track, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: colors.progress.fill }, fill]} />
      </View>
    </View>
  );
}
