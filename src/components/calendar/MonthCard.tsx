import { format } from 'date-fns';
import { Pressable, Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { YearDay } from './YearDay';

type Props = { year: number; month0: number; current?: boolean; todayDay?: number; onPress: () => void };

export function MonthCard({ year, month0, current, todayDay, onPress }: Props) {
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Monday first
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={format(first, 'MMMM yyyy')} onPress={onPress}
      style={{ flex: 1, padding: space[8], borderRadius: radius.m, backgroundColor: current ? colors.surface.raised : 'transparent' }}>
      <Text style={[type.calendarMonth, { color: colors.text.primary, marginBottom: 4 }]}>{format(first, 'MMM')}</Text>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {row.map((d, j) => <YearDay key={j} day={d} state={d !== null && todayDay === d && current ? 'today' : j >= 5 ? 'weekend' : 'default'} />)}
        </View>
      ))}
    </Pressable>
  );
}
