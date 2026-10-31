// Figma search result: the Novena Row (tall picture, title, tagline, tag pill) with a hairline under it.
import { View } from 'react-native';
import { colors, stroke } from '@/constants/theme';
import type { Novena } from '@/content/types';
import { NovenaRow } from './NovenaRow';

export const SearchResultRow = (p: { novena: Novena; onPress: () => void }) => (
  <View style={{ paddingVertical: 8, borderBottomWidth: stroke.hairline, borderColor: colors.border.default }}>
    <NovenaRow {...p} />
  </View>
);
