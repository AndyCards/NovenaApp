import { Pressable, Text } from 'react-native';
import { colors, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';

export function SuggestionRow({ label, kind = 'query', onPress }: { label: string; kind?: 'query' | 'novena'; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space[10], paddingHorizontal: space[10], backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <Icon name={kind === 'query' ? 'search' : 'book'} color={colors.icon.secondary} size={16} />
      <Text style={[type.bodyLarge, { color: colors.text.body }]}>{label}</Text>
    </Pressable>
  );
}
