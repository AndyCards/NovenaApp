import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';

export function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle?: string; onSeeAll?: () => void }) {
  return (
    <View style={{ paddingHorizontal: screenMargin, paddingVertical: 8, flexDirection: 'row', alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[type.headingH2, { color: colors.text.primary }]}>{title}</Text>
        {subtitle ? <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={10}><Text style={[type.labelSmall, { color: colors.text.secondary }]}>See all</Text></Pressable> : null}
    </View>
  );
}
