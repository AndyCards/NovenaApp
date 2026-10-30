// Reader screens only: Source Serif 4, never smaller than 17.
import { Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function PrayerParagraph({ text }: { text: string }) {
  return <Text style={[type.readerProse, { color: colors.text.body }]}>{text}</Text>;
}
