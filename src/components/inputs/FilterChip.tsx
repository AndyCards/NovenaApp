// Figma "Filter Chip": outlined pill; selected = solid dark grey with white text.
// Motion: fill and text colour fade between selected and not, and the chip dips slightly under a finger.
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PressableScale } from '@/motion/PressableScale';
import { duration, ease } from '@/motion/tokens';
import { haptics } from '@/motion/haptics';

const AnimatedText = Animated.createAnimatedComponent(Text);

export function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => { p.value = withTiming(selected ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [selected, p]);
  const chip = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [colors.surface.default, colors.action.primary]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.border.default, colors.action.primary]),
  }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [colors.text.body, colors.text.onAction]) }));
  return (
    <PressableScale accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={() => { if (!selected) haptics.tap(); onPress(); }}>
      <Animated.View style={[{ height: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.full, borderWidth: stroke.hairline * 2 }, chip]}>
        <AnimatedText style={[type.labelChip, text]}>{label}</AnimatedText>
      </Animated.View>
    </PressableScale>
  );
}
