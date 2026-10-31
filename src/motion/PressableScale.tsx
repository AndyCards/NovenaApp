// A Pressable that gently shrinks while a finger is on it and eases back on release, like iOS buttons.
// Runs on the phone's UI thread, so it never waits for the app's own code.
// With Reduce Motion on, it skips the shrinking and only dims slightly.
import { useState } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { duration, ease, pressScale, spring } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((s: { pressed: boolean }) => StyleProp<ViewStyle>);
  scaleTo?: number; // how small it gets while pressed (1 = no shrinking)
  dimTo?: number; // how faint it gets while pressed (1 = no dimming)
};

export function PressableScale({ style, scaleTo = pressScale.button, dimTo = 1, onPressIn, onPressOut, disabled, ...rest }: Props) {
  const reduced = useReducedMotion();
  const down = useSharedValue(0); // 0 = resting, 1 = finger down
  const [pressed, setPressed] = useState(false); // only needed when the style itself reacts to pressing
  const dim = reduced ? Math.min(dimTo, 0.85) : dimTo; // with Reduce Motion, dim instead of shrinking
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : 1 - (1 - scaleTo) * down.value }],
    opacity: 1 - (1 - dim) * down.value,
  }));
  const handleIn = (e: GestureResponderEvent) => {
    if (disabled) return;
    down.value = withTiming(1, { duration: duration.press, easing: ease.out });
    if (typeof style === 'function') setPressed(true);
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    down.value = withSpring(0, spring.release);
    if (typeof style === 'function') setPressed(false);
    onPressOut?.(e);
  };
  const resolved = typeof style === 'function' ? style({ pressed }) : style;
  return <AnimatedPressable {...rest} disabled={disabled} onPressIn={handleIn} onPressOut={handleOut} style={[resolved, animated]} />;
}
