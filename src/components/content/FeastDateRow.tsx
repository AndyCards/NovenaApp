import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { formatMonthDay } from '@/utils/dateUtils';
import { SaintAvatar } from './SaintAvatar';

type Props = { saintName: string; avatar?: string; feastDate: string; startDate: string; onPress: () => void };

export function FeastDateRow({ saintName, avatar, feastDate, startDate, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${strings.calendar.feastDay(saintName)}, ${formatMonthDay(feastDate)}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[12], minHeight: 64, paddingHorizontal: screenMargin, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <SaintAvatar name={saintName} file={avatar} />
      <View style={{ flex: 1 }}>
        <Text style={[type.titleSmall, { color: colors.text.primary }]}>{strings.calendar.feastDay(saintName)}</Text>
        <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.calendar.novenaStarts(formatMonthDay(startDate))}</Text>
      </View>
      <Text style={[type.labelCaption, { color: colors.text.tertiary }]}>{formatMonthDay(feastDate)}</Text>
    </Pressable>
  );
}
