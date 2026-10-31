// One feast in "All feast days this month" (Figma "Feast Date Row"):
// date block (OCT / 19), saint picture, title, "Novena starts Oct 11", arrow.
import { format, parseISO } from 'date-fns';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { formatMonthDay } from '@/utils/dateUtils';
import { Icon } from '../Icon';
import { SaintAvatar } from './SaintAvatar';

// feastDate and startDate are plain dates like "2026-10-19".
type Props = { saintName: string; avatar?: string; feastDate: string; startDate: string; onPress: () => void };

export function FeastDateRow({ saintName, avatar, feastDate, startDate, onPress }: Props) {
  const d = parseISO(feastDate);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${strings.calendar.feastDay(saintName)}, ${formatMonthDay(feastDate)}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <View style={{ width: 32, alignItems: 'center' }}>
        <Text style={[type.labelXSmall, { color: colors.text.tertiary, textTransform: 'uppercase' }]}>{format(d, 'MMM')}</Text>
        <Text style={[type.titleCard, { color: colors.text.primary }]}>{format(d, 'd')}</Text>
      </View>
      <SaintAvatar name={saintName} file={avatar} size="row" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.labelMedium, { color: colors.text.primary }]}>{strings.calendar.feastDay(saintName)}</Text>
        <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{strings.calendar.novenaStarts(formatMonthDay(startDate))}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={colors.icon.secondary} />
    </Pressable>
  );
}
