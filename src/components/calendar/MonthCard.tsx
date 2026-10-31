// A small month for the year view (Figma "Month Card"): white card, month name, M–S letters, days.
import { format } from 'date-fns';
import { Pressable, Text, View } from 'react-native';
import { colors, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { YearDay } from './YearDay';

type Props = { year: number; month0: number; current?: boolean; todayDay?: number; onPress: () => void };

export function MonthCard({ year, month0, current, todayDay, onPress }: Props) {
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // weeks start on Monday
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={format(first, 'MMMM yyyy')} onPress={onPress}
      style={{ flex: 1, padding: 8, paddingBottom: 12, borderRadius: 12, borderWidth: stroke.hairline, borderColor: colors.border.subtle, backgroundColor: colors.surface.default,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
      <Text style={[type.calendarMonth, { color: colors.text.primary, marginBottom: 4 }]}>{format(first, 'MMM')}</Text>
      <View style={{ flexDirection: 'row', borderBottomWidth: stroke.hairline, borderColor: colors.border.default, paddingBottom: 2, marginBottom: 2 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} style={[type.calendarYearWeekday, { flex: 1, textAlign: 'center', color: colors.text.primary}]}>{d}</Text>)}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {row.map((d, j) => <YearDay key={j} day={d} state={d !== null && current && todayDay === d ? 'today' : 'default'} />)}
        </View>
      ))}
    </Pressable>
  );
}
