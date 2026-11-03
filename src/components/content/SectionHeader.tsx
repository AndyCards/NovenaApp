// Figma "Section Header" (124:1169): px 10, py 6; the heading only (Label/Large, py 1), with an optional "See all".
// Andy, 2026-11-01: section headers show the heading only, no description line underneath.
import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';

export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={{ paddingHorizontal: screenMargin, paddingVertical: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 1 }}>
        <Text accessibilityRole="header" style={[type.labelLarge, { flex: 1, color: colors.text.primary }]}>{title}</Text>
        {onSeeAll ? <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={10}><Text style={[type.labelSmall, { color: colors.text.secondary }]}>See all</Text></Pressable> : null}
      </View>
    </View>
  );
}
