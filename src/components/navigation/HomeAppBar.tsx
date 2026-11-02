// Figma "Home App Bar": logo and wordmark on the left, Calendar and Search buttons on the right.
// Frosted glass like the tab bar. It floats over the top of the page (and the status bar area), so Home scrolls underneath it
// and shows through the glass. Its shadow shows only once Home has scrolled. Home leaves HOME_APP_BAR_HEIGHT + the top safe area free at the top of its scrolling content.
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { screenMargin } from '@/constants/theme';
import { BrandLogo } from '../BrandLogo';
import { GlassSurface } from '../GlassSurface';
import { Icon } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

export const HOME_APP_BAR_HEIGHT = 62;

export function HomeAppBar({ onCalendar, onSearch, scrolled = false }: { onCalendar: () => void; onSearch: () => void; scrolled?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <GlassSurface edge="top" raised={scrolled} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }} contentStyle={{ paddingTop: insets.top }}>
      <View style={{ height: HOME_APP_BAR_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: screenMargin, paddingTop: 4, paddingBottom: 8 }}>
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
    </GlassSurface>
  );
}
