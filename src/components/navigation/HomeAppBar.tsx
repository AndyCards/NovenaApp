// Figma "Home App Bar": logo and wordmark on the left, Calendar and Search buttons on the right.
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenMargin, stroke } from '@/constants/theme';
import { duration, ease } from '@/motion/tokens';
import { BrandLogo } from '../BrandLogo';
import { Icon } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

// The bar also covers the phone's status bar area (clock, battery), so the two read as ONE surface and the shadow falls only under the whole thing.
// `raised` is true once the page has scrolled: the bar then gains a hairline border and a soft shadow, as if lifted off the page.
export function HomeAppBar({ onCalendar, onSearch, raised = false }: { onCalendar: () => void; onSearch: () => void; raised?: boolean }) {
  const insets = useSafeAreaInsets();
  const r = useSharedValue(0);
  useEffect(() => { r.value = withTiming(raised ? 1 : 0, { duration: duration.fade, easing: ease.out }); }, [raised, r]);
  const lift = useAnimatedStyle(() => ({
    shadowOpacity: 0.1 * r.value,
    borderBottomColor: interpolateColor(r.value, [0, 1], ['rgba(209,209,209,0)', colors.border.default]),
  }));
  return (
    <Animated.View style={[{ zIndex: 1, paddingTop: insets.top, backgroundColor: colors.surface.default, borderBottomWidth: stroke.hairline, shadowColor: '#000', shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 0 }, lift]}>
    <View style={{ height: 62, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: screenMargin, paddingTop: 4, paddingBottom: 8, backgroundColor: colors.surface.default }}>
      {/* The logo: arched-window mark and the pocketNovena name (Poppins SemiBold 20, grey gradient). */}
      <View accessibilityRole="header"><BrandLogo /></View>
      <View style={{ flex: 1 }} />
      <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel="Calendar" onPress={onCalendar} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="calendar" />
      </PressableScale>
      <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel="Search" onPress={onSearch} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="search" />
      </PressableScale>
    </View>
    </Animated.View>
  );
}
