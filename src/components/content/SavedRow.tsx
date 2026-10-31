// Figma "Saved Row": art 60×70, title, one-line tagline, bookmark button (tap to unsave).
import { Pressable, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; onPress: () => void; subtitle?: string; onUnsave?: () => void };

export function SavedRow({ novena, onPress, subtitle, onUnsave }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={novena.title} onPress={onPress}
      style={({ pressed }) => ({ height: 84, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 10, paddingRight: 4, paddingVertical: 10, backgroundColor: pressed ? colors.surface.raised : 'transparent' })}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 60, height: 70, borderRadius: radius.s }} />
      <View style={{ flex: 1, gap: 6 }}>
        <Text numberOfLines={1} style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
        <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.secondary }]}>{subtitle ?? novena.tagline}</Text>
      </View>
      {onUnsave ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Remove from saved" onPress={onUnsave} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bookmark" size={22} weight="fill" />
        </Pressable>
      ) : <View style={{ width: 44, alignItems: 'center' }}><Icon name="chevronRight" size={20} color={colors.icon.secondary} /></View>}
    </Pressable>
  );
}
