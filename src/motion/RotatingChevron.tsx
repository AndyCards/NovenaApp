// A chevron that turns smoothly from "›" (closed) to "⌄" (open) when a section folds or unfolds.
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/Icon';
import { duration, ease } from './tokens';

export function RotatingChevron({ open, size, color }: { open: boolean; size: number; color: string }) {
  const p = useSharedValue(open ? 1 : 0);
  useEffect(() => { p.value = withTiming(open ? 1 : 0, { duration: duration.fade, easing: ease.out }); }, [open, p]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${p.value * 90}deg` }] }));
  return <Animated.View style={style}><Icon name="chevronRight" size={size} color={color} /></Animated.View>;
}
