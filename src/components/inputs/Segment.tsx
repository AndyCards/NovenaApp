// Figma "Segment": label + round count chip. The white selected pill is drawn by SegmentedControl,
// which slides it between segments. Here the label and chip colours fade between selected and not.
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { duration, ease } from '@/motion/tokens';

const AnimatedText = Animated.createAnimatedComponent(Text);

export function Segment({ label, count: rawCount, selected, onPress }: { label: string; count?: number; selected: boolean; onPress: () => void }) {
  const count = rawCount && rawCount > 0 ? rawCount : undefined; // no number bubble when there are none
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => { p.value = withTiming(selected ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [selected, p]);
  const labelColor = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [colors.text.secondary, colors.text.primary]) }));
  const chip = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface.strong, colors.action.primary]) }));
  const chipText = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [colors.text.secondary, colors.text.onAction]) }));
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={count === undefined ? label : `${label}, ${count}`} onPress={onPress}
      style={{ flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: radius.m }}>
      <AnimatedText style={[type.labelSmall, labelColor]}>{label}</AnimatedText>
      {count === undefined ? null : (
        <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, chip]}>
          <AnimatedText style={[type.bodySmall, chipText]}>{count}</AnimatedText>
        </Animated.View>
      )}
    </Pressable>
  );
}
