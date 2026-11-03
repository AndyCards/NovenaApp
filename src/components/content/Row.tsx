// Shared look for list rows (Novena row, Saved row, Search result row, Feast row).
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; subtitle?: string; trailing?: ReactNode; onPress: () => void };

export function NovenaListRow({ novena, subtitle, trailing, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${subtitle ?? novena.tagline}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[12], paddingHorizontal: screenMargin, paddingVertical: space[8], minHeight: 64, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 48, height: 48, borderRadius: radius.s }} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text numberOfLines={1} style={[type.bodyMedium, { color: colors.text.tertiary }]}>{subtitle ?? novena.tagline}</Text>
      </View>
      {trailing}
    </Pressable>
  );
}
