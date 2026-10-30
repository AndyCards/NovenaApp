import { Pressable, Text, View } from 'react-native';
import { colors, elevation, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { NovenaImage } from './NovenaImage';

export function NovenaCard({ novena, onPress, width = 160 }: { novena: Novena; onPress: () => void; width?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress} style={{ width }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width, height: width * 1.1, borderRadius: radius.m }} />
      <View style={{ paddingTop: space[8], gap: 2 }}>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text numberOfLines={1} style={[type.bodyMedium, { color: colors.text.tertiary }]}>{novena.tagline}</Text>
      </View>
    </Pressable>
  );
}
