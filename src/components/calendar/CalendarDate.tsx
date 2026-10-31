// One day in the month calendar (Figma "Calendar Date"): the number at the top,
// a dark circle on today, and the saint's small round picture on a feast day.
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { SaintAvatar } from '../content/SaintAvatar';

type Props = { day: number | null; today?: boolean; saintName?: string; saintAvatar?: string; onPress?: () => void };

export function CalendarDate({ day, today, saintName, saintAvatar, onPress }: Props) {
  if (day === null) return <View style={{ flex: 1 }} />;
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} accessibilityLabel={`${day}${saintName ? `, ${saintName} feast day` : ''}${today ? ', today' : ''}`} onPress={onPress}
      style={{ flex: 1, minHeight: 66, alignItems: 'center', paddingTop: 6, gap: 4 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: today ? colors.action.primary : 'transparent' }}>
        <Text style={[type.calendarDay, { fontSize: 15, color: today ? colors.text.onAction : colors.text.secondary }]}>{day}</Text>
      </View>
      {saintName ? <SaintAvatar name={saintName} file={saintAvatar} size="tiny" /> : null}
    </Pressable>
  );
}
