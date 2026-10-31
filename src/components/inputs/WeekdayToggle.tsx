// Figma "Weekday Toggle": 44 high circle. On = solid grey, Off = soft gradient.
// Motion: the grey fill fades in over the soft gradient, and the circle dips slightly under a finger.
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PressableScale } from '@/motion/PressableScale';
import { duration, ease, pressScale } from '@/motion/tokens';
import { haptics } from '@/motion/haptics';

const AnimatedText = Animated.createAnimatedComponent(Text);

export function WeekdayToggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [on, p]);
  const fill = useAnimatedStyle(() => ({ opacity: p.value }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [colors.text.body, colors.surface.raised]) }));
  return (
    <PressableScale scaleTo={pressScale.icon} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={() => { haptics.tap(); onPress(); }} style={{ flex: 1 }}>
      <View style={{ height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border.subtle, overflow: 'hidden' }}>
        <LinearGradient colors={['#EFEFEF', '#FBFBFB']} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.action.selected }, fill]} />
        <AnimatedText style={[type.labelSmall, text]}>{label.slice(0, 1)}</AnimatedText>
      </View>
    </PressableScale>
  );
}
