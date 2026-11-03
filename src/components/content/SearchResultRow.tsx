// One result in the search list. Matches Figma "Search Result Row": a 88x104
// picture on the left, then the novena name, a short line, and one tag pill.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { Pill } from '../inputs/Pill';
import { NovenaImage } from './NovenaImage';

export const SearchResultRow = ({ novena, onPress }: { novena: Novena; onPress: () => void }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress}
    style={({ pressed }) => ({ flexDirection: 'row', gap: 12, padding: screenMargin, borderBottomWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: pressed ? colors.surface.subtle : colors.surface.default })}>
    <NovenaImage image={novena.image} label={novena.title} style={{ width: 88, height: 104, borderRadius: radius.xs + 3 }} />
    <View style={{ flex: 1, justifyContent: 'space-between', gap: 4 }}>
      <View style={{ gap: 2 }}>
        <Text numberOfLines={1} style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
        <Text numberOfLines={2} style={[type.bodyMedium, { color: colors.text.secondary }]}>{novena.tagline}</Text>
      </View>
      {novena.tags[0] ? <Pill label={novena.tags[0]} /> : null}
    </View>
  </Pressable>
);
