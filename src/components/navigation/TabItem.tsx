// Figma "Tab Item Detailed": active tab gets a soft pill behind a filled icon.
// Motion: the pill and filled icon fade in as the tab becomes active, and the tab dips slightly under a finger.
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { PressableScale } from '@/motion/PressableScale';
import { duration, ease, pressScale } from '@/motion/tokens';
import { Icon, type IconName } from '../Icon';
import { haptics } from '@/motion/haptics';

type Props = { label: string; icon: IconName; active: boolean; onPress: () => void };

export function TabItem({ label, icon, active, onPress }: Props) {
  const p = useSharedValue(active ? 1 : 0);
  useEffect(() => { p.value = withTiming(active ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [active, p]);
  const pill = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.9 + 0.1 * p.value }] }));
  const filled = useAnimatedStyle(() => ({ opacity: p.value }));
  const outlined = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  return (
    <PressableScale scaleTo={pressScale.icon + 0.03} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={() => { if (!active) haptics.tap(); onPress(); }}
      style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4 }}>
      <View style={{ height: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radius.m }}>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: radius.m, backgroundColor: colors.surface.subtle }, pill]} />
        {/* Two icons are stacked: the outlined one fades out as the filled one fades in. */}
        <Animated.View style={outlined}><Icon name={icon} size={28} weight="light" color={colors.icon.secondary} /></Animated.View>
        <Animated.View style={[{ position: 'absolute', left: 16 }, filled]}><Icon name={icon} size={28} weight="fill" color={colors.icon.default} /></Animated.View>
      </View>
      <Text style={[active ? type.labelTabActive : type.labelTab, { color: active ? colors.text.primary : colors.text.tertiary }]}>{label}</Text>
    </PressableScale>
  );
}
