// Figma "Section Header": title (Label/Large) and an optional subtitle (Body/Large).
import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';

export function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle?: string; onSeeAll?: () => void }) {
  return (
    <View style={{ paddingHorizontal: screenMargin, paddingVertical: 6, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text accessibilityRole="header" style={[type.labelLarge, { flex: 1, color: colors.text.primary }]}>{title}</Text>
        {onSeeAll ? <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={10}><Text style={[type.labelSmall, { color: colors.text.secondary }]}>See all</Text></Pressable> : null}
      </View>
      {subtitle ? <Text style={[type.bodyLarge, { color: colors.text.tertiary }]}>{subtitle}</Text> : null}
    </View>
  );
}
