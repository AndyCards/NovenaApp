// The frosted-glass surface shared by the tab bar, the top nav bars and the Home app bar (Figma Glass/Tab Bar):
// 72% warm paper fill, 24 blur, a hairline edge and a very soft shadow. Content that scrolls underneath shows through, blurred.
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
  const lines: ViewStyle = edge === 'top'
    ? { borderBottomWidth: 0.5, borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: colors.glass.tabBarBorder, borderBottomLeftRadius: TOP_BAR_RADIUS, borderBottomRightRadius: TOP_BAR_RADIUS, overflow: 'hidden', shadowOffset: { width: 0, height: 4 } }
    : { borderTopWidth: 0.5, borderColor: colors.glass.tabBarBorder, shadowOffset: { width: 0, height: -4 } };
  const shadow: ViewStyle = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 };
  if (solid) return <View style={[{ backgroundColor: colors.surface.raised }, lines, style]}>{children}</View>;
  return <BlurView intensity={blur.glass} tint="light" style={[{ backgroundColor: colors.glass.tabBarFill }, shadow, lines, style]}>{children}</BlurView>;
}
