// The frosted-glass surface shared by the tab bar, the top nav bars and the Home app bar (Figma Glass/Tab Bar):
// 70% pure white fill (no cream), a strong blur, a hairline edge and a very soft shadow. Content that scrolls underneath shows through, blurred.
// Top bars cover the status bar area too: the glass runs to the very top of the screen.
// The hairline and shadow show only when `raised` is true. Top bars pass it once the page has scrolled (Andy, 2026-11-02), and it fades in and out.
// If the person turned on "Reduce Transparency" in iPhone settings it becomes a solid light surface instead.
import { BlurView } from 'expo-blur';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { blur, colors } from '@/constants/theme';

type Props = {
  edge: 'top' | 'bottom';
  children: ReactNode;
  /** Where the bar sits (position, zIndex). */
  style?: StyleProp<ViewStyle>;
  /** Padding inside the glass, e.g. the status bar height for a top bar. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Show the hairline and soft shadow. Default true. */
  raised?: boolean;
};

export function GlassSurface({ edge, children, style, contentStyle, raised = true }: Props) {
  const [solid, setSolid] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceTransparencyEnabled().then(setSolid); }, []);
  const isTop = edge === 'top';
  const lift = useSharedValue(raised ? 1 : 0);
  useEffect(() => { lift.value = withTiming(raised ? 1 : 0, { duration: 200 }); }, [raised, lift]);
  // The outer view carries the shadow and the position. It must not clip, or iOS hides the shadow.
  const shadow = useAnimatedStyle(() => ({ shadowOpacity: 0.06 * lift.value }));
  const line = useAnimatedStyle(() => ({ opacity: lift.value }));
  const hairline = (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: colors.glass.tabBarBorder }, isTop ? { bottom: 0 } : { top: 0 }, line]} />
  );
  return (
    <Animated.View style={[{ shadowColor: '#000', shadowRadius: 10, shadowOffset: { width: 0, height: isTop ? 4 : -4 } }, shadow, style]}>
      {solid ? (
        <View style={[{ backgroundColor: colors.surface.raised }, contentStyle]}>{children}{hairline}</View>
      ) : (
        // Figma's "blur 24" is a pixel radius; expo-blur's intensity is 0–100, so it needs a higher number to look the same.
        <BlurView intensity={blur.glass} tint="light" experimentalBlurMethod="dimezisBlurView" style={[{ backgroundColor: colors.glass.tabBarFill, overflow: 'hidden' }, contentStyle]}>
          {children}
          {hairline}
        </BlurView>
      )}
    </Animated.View>
  );
}
