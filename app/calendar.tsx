// Calendar, Figma Page 34 (1227:59288 month, 1227:59528 year).
// Month view: a month card with feast-day saint pictures, then this month's feasts.
// The calendar button at the top right switches to the year view; tap a month to go back.
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDate } from '@/components/calendar/CalendarDate';
import { YearCalendarGrid } from '@/components/calendar/YearCalendarGrid';
import { FeastDateRow } from '@/components/content/FeastDateRow';
import { Icon, type IconName } from '@/components/Icon';
import { colors, radius, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { feastsInMonth } from '@/utils/feasts';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function RoundButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} />
    </Pressable>
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const now = new Date();
  const [view, setView] = useState<'month' | 'year'>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth()); // 0 = January

  const feasts = feastsInMonth(catalog, year, month0 + 1);
  const feastByDay = new Map(feasts.map((f) => [Number(f.feastDate.slice(8, 10)), f]));

  // Build the grid: empty cells before the 1st (weeks start Monday), then the days.
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (number | null)[] = [...Array((first.getDay() + 6) % 7).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  const isThisMonth = year === now.getFullYear() && month0 === now.getMonth();

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenMargin + 2 }}>
        <RoundButton icon="back" label={strings.common.back} onPress={() => (view === 'year' ? setView('month') : router.back())} />
        <Text accessibilityRole="header" style={[type.titleMedium, { flex: 1, textAlign: 'center', color: colors.text.secondary }]}>{strings.calendar.title}</Text>
        {view === 'month' ? <RoundButton icon="calendar" label="Year view" onPress={() => setView('year')} /> : <View style={{ width: 44 }} />}
      </View>

      {view === 'year' ? (
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 60 }}>
          <YearCalendarGrid year={year} today={now} onSelectMonth={(m) => { setMonth0(m); setView('month'); }} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 60, gap: 24 }}>
          <View style={{ marginHorizontal: screenMargin, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, paddingHorizontal: 10, paddingTop: 14, paddingBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4, marginBottom: 6 }}>
              <Text style={[type.titleCard, { flex: 1, fontSize: 20, color: colors.text.primary }]}>{format(first, 'MMMM yyyy')}</Text>
              <RoundButton icon="chevronLeft" label="Previous month" onPress={() => shiftMonth(-1)} />
              <RoundButton icon="chevronRight" label="Next month" onPress={() => shiftMonth(1)} />
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
              {WEEKDAYS.map((d) => <Text key={d} style={[type.bodyMedium, { flex: 1, textAlign: 'center', color: colors.text.secondary }]}>{d}</Text>)}
            </View>
            {weeks.map((week, i) => (
              <View key={i} style={{ flexDirection: 'row', borderTopWidth: stroke.hairline, borderColor: colors.border.subtle }}>
                {week.map((day, j) => {
                  const feast = day === null ? undefined : feastByDay.get(day);
                  return (
                    <CalendarDate key={j} day={day} today={isThisMonth && day === now.getDate()}
                      saintName={feast?.saint.name} saintAvatar={feast?.saint.avatar}
                      onPress={feast?.novena ? () => router.push(`/novena/${feast.novena!.id}`) : undefined} />
                  );
                })}
              </View>
            ))}
          </View>

          {feasts.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.secondary, paddingHorizontal: screenMargin }]}>{strings.calendar.feastsThisMonth}</Text>
              <View style={{ marginHorizontal: screenMargin, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, overflow: 'hidden' }}>
                {feasts.map((f, i) => (
                  <View key={f.saint.id} style={{ borderTopWidth: i ? stroke.hairline : 0, borderColor: colors.border.subtle }}>
                    <FeastDateRow saintName={f.saint.name} avatar={f.saint.avatar} feastDate={f.feastDate} startDate={f.startDate}
                      onPress={() => f.novena && router.push(`/novena/${f.novena.id}`)} />
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
