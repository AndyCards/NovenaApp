// Figma "Suggestion Row": magnifier + suggestion, with the typed part in bold.
import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { Icon } from '../Icon';

export function SuggestionRow({ label, match = '', onPress }: { label: string; match?: string; kind?: 'query' | 'novena'; onPress: () => void }) {
  const i = match ? label.toLowerCase().indexOf(match.toLowerCase()) : -1;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ height: 46, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <Icon name="search" size={20} />
      <Text style={[type.bodyLarge, { color: colors.text.body }]}>
        {i < 0 ? label : (
          <>
            {label.slice(0, i)}
            <Text style={{ fontFamily: fonts.bold, color: colors.text.primary }}>{label.slice(i, i + match.length)}</Text>
            {label.slice(i + match.length)}
          </>
        )}
      </Text>
    </Pressable>
  );
}
