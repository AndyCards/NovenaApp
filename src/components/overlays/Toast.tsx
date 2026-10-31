// A short message with an optional Undo, for example "Removed from Saved · Undo".
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, elevation, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { duration, ease } from '@/motion/tokens';
import { haptics } from '@/motion/haptics';

type Props = { message: string | null; onUndo?: () => void; onDismiss: () => void; durationMs?: number };

// The message rises in from just below and fades; on dismissal it sinks and fades faster.
const toastIn = () => {
  'worklet';
  return { initialValues: { opacity: 0, transform: [{ translateY: 24 }] },
    animations: { opacity: withTiming(1, { duration: duration.fade, easing: ease.out }), transform: [{ translateY: withTiming(0, { duration: duration.sheetIn, easing: ease.sheet }) }] } };
};
const toastOut = () => {
  'worklet';
  return { initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
    animations: { opacity: withTiming(0, { duration: duration.quick, easing: ease.in }), transform: [{ translateY: withTiming(16, { duration: duration.quick, easing: ease.in }) }] } };
};

export function Toast({ message, onUndo, onDismiss, durationMs = 4000 }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [message, onDismiss, durationMs]);
  if (!message) return null;
  return (
    <Animated.View entering={reduced ? undefined : toastIn} exiting={reduced ? undefined : toastOut} accessibilityLiveRegion="polite" style={[{ position: 'absolute', left: screenMargin, right: screenMargin, bottom: insets.bottom + 100, flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.full, backgroundColor: colors.action.media }, elevation.card]}>
      <Text style={[type.bodyLarge, { flex: 1, color: colors.text.onAction }]}>{message}</Text>
      {onUndo ? (
        <Pressable accessibilityRole="button" onPress={() => { haptics.tap(); onUndo(); onDismiss(); }} hitSlop={12}>
          <Text style={[type.labelMedium, { color: colors.text.onAction }]}>{strings.library.undo}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
