// The frosted-glass surface shared by the tab bar, the top nav bars and the Home app bar (Figma Glass/Tab Bar):
// 70% pure white fill, 24 blur, a hairline edge and a very soft shadow. Content that scrolls underneath shows through, blurred.
// If the person turned on "Reduce Transparency" in iPhone settings it becomes a solid light surface instead.
import { BlurView } from 'expo-blur';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from 'react-native';
import { blur, colors } from '@/constants/theme';

export const TOP_BAR_RADIUS = 24;

type Props = { edge: 'top' | 'bottom'; children: ReactNode; style?: StyleProp<ViewStyle> };

export function GlassSurface({ edge, children, style }: Props) {
  const [solid, setSolid] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceTransparencyEnabled().then(setSolid); }, []);
  // `edge` is the side that touches the page: the hairline and the shadow sit there.
  // Top bars get soft rounded bottom corners (Andy, 2026-11-02: "cute"), so the bar reads like a little sheet resting on the page.
  const isTop = edge === 'top';
  // The outer view carries the shadow and the position. It must not clip, or iOS hides the shadow.
  const outer: ViewStyle = {
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: isTop ? 4 : -4 },
    ...(isTop ? { borderBottomLeftRadius: TOP_BAR_RADIUS, borderBottomRightRadius: TOP_BAR_RADIUS } : null),
  };
  // The inner view is the glass itself: it clips the blur to the rounded corners and draws the hairline.
  const inner: ViewStyle = isTop
    ? { borderBottomWidth: 0.5, borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: colors.glass.tabBarBorder, borderBottomLeftRadius: TOP_BAR_RADIUS, borderBottomRightRadius: TOP_BAR_RADIUS, overflow: 'hidden' }
    : { borderTopWidth: 0.5, borderColor: colors.glass.tabBarBorder, overflow: 'hidden' };
  return (
    <View style={[outer, style]}>
      {solid ? (
        <View style={[{ backgroundColor: colors.surface.raised }, inner]}>{children}</View>
      ) : (
        // Figma's "blur 24" is a pixel radius; expo-blur's intensity is 0–100, so it needs a higher number to look the same.
        <BlurView intensity={blur.glass} tint="light" experimentalBlurMethod="dimezisBlurView" style={[{ backgroundColor: colors.glass.tabBarFill }, inner]}>
          {children}
        </BlurView>
      )}
    </View>
  );
}
