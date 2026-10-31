// One tiny day number inside a small month card in the year view. Today gets a dark circle.
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function YearDay({ day, state = 'default' }: { day: number | null; state?: 'default' | 'weekend' | 'today' }) {
  return (
    <View style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: state === 'today' ? colors.action.selected : 'transparent' }}>
      {day !== null ? <Text style={[type.calendarYearDay, { color: state === 'today' ? colors.text.onAction : state === 'weekend' ? colors.text.tertiary : colors.text.primary }]}>{day}</Text> : null}
    </View>
  );
}
