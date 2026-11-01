// The year view of the Calendar: twelve small month cards, three per row. Tapping one opens that month.
import { View } from 'react-native';
import { screenMargin } from '@/constants/theme';
import { MonthCard } from './MonthCard';

export function YearCalendarGrid({ year, today, onSelectMonth }: { year: number; today: Date; onSelectMonth: (month0: number) => void }) {
  const rows = [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => r * 3 + c));
  return (
    <View style={{ paddingHorizontal: screenMargin, gap: 10 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {row.map((m) => (
            <MonthCard key={m} year={year} month0={m} current={today.getFullYear() === year && today.getMonth() === m} todayDay={today.getDate()} onPress={() => onSelectMonth(m)} />
          ))}
        </View>
      ))}
    </View>
  );
}
