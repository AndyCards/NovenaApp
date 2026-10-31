// Figma "Home App Bar": logo and wordmark on the left, Calendar and Search buttons on the right.
import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { Icon } from '../Icon';

export function HomeAppBar({ onCalendar, onSearch }: { onCalendar: () => void; onSearch: () => void }) {
  return (
    <View style={{ height: 62, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: screenMargin, paddingTop: 4, paddingBottom: 8, backgroundColor: colors.surface.default }}>
      {/* Logo mark goes here once it can be exported from Figma. */}
      <Text accessibilityRole="header" style={{ fontFamily: fonts.semibold, fontSize: 20, letterSpacing: -0.8, color: colors.text.secondary }}>pocketNovena</Text>
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
