import { Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';

export function DurationLabel({ minutes }: { minutes: number }) {
  return <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.novena.minutesPerDay(minutes)}</Text>;
}
