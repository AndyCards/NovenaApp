// Figma "Suggestion Row" (1323:9935): 20 magnifier + suggestion (15 on 21), 12 above and below, typed part in bold.
import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { Icon } from '../Icon';

export function SuggestionRow({ label, match = '', onPress }: { label: string; match?: string; kind?: 'query' | 'novena'; onPress: () => void }) {
  const i = match ? label.toLowerCase().indexOf(match.toLowerCase()) : -1;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <Icon name="search" size={20} />
      <Text style={[type.bodyLarge, { flex: 1, lineHeight: 21, color: colors.text.body }]}>
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
