// Figma "Duration Label": clock icon + "5 mins a day".
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Icon } from '../Icon';

export function DurationLabel({ minutes }: { minutes: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 }}>
      <Icon name="clock" size={18} color={colors.text.secondary} />
      <Text style={[type.bodySmall, { color: colors.text.secondary }]}>{strings.novena.minutesPerDay(minutes)}</Text>
    </View>
  );
}
