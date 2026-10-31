// Figma "Home App Bar": logo and wordmark on the left, Calendar and Search buttons on the right.
import { Pressable, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { BrandLogo } from '../BrandLogo';
import { Icon } from '../Icon';

export function HomeAppBar({ onCalendar, onSearch }: { onCalendar: () => void; onSearch: () => void }) {
  return (
    <View style={{ height: 62, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: screenMargin, paddingTop: 4, paddingBottom: 8, backgroundColor: colors.surface.default }}>
      {/* The logo: arched-window mark and the pocketNovena name (Poppins SemiBold 20, grey gradient). */}
      <View accessibilityRole="header"><BrandLogo /></View>
      <View style={{ flex: 1 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Calendar" onPress={onCalendar} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="calendar" />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={onSearch} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="search" />
      </Pressable>
    </View>
  );
}
