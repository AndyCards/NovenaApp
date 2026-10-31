// Reader screens only: Source Serif 4, 17/24, never smaller.
import { Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function PrayerParagraph({ text }: { text: string }) {
  return <Text selectable style={[type.readerProse, { color: colors.text.primary }]}>{text}</Text>;
}
