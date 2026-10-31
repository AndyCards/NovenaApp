// Figma "Switch": 46×28. On = dark track, Off = light grey track; white knob.
// Motion: the knob glides across and the track colour fades between off and on.
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, stroke } from '@/constants/theme';
import { spring } from '@/motion/tokens';

export function Switch({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  const on = useSharedValue(value ? 1 : 0); // 0 = off, 1 = on
  useEffect(() => { on.value = withSpring(value ? 1 : 0, spring.settle); }, [value, on]);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.surface.subtle, colors.action.primary]),
    borderColor: interpolateColor(on.value, [0, 1], [colors.border.subtle, colors.action.primary]),
  }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: on.value * 17.6 }] }));
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} hitSlop={8} onPress={() => onValueChange(!value)}>
      <Animated.View style={[{ width: 46, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center', borderWidth: stroke.hairline }, track]}>
        <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface.default,
          shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }, knob]} />
      </Animated.View>
    </Pressable>
  );
}
