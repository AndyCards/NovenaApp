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
import { Reveal } from '@/motion/Reveal';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function RoundButton({ icon, label, onPress, size = 44, iconSize = 22 }: { icon: IconName; label: string; onPress: () => void; size?: number; iconSize?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={iconSize} />
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

  // Saints whose feast falls in the month on screen, looked up by day number for the grid.
  const feasts = feastsInMonth(catalog, year, month0 + 1);
  const feastByDay = new Map(feasts.map((f) => [Number(f.feastDate.slice(8, 10)), f]));

  // Build the grid: empty cells before the 1st (weeks start Monday), then the days.
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (number | null)[] = [...Array((first.getDay() + 6) % 7).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  const isThisMonth = year === now.getFullYear() && month0 === now.getMonth();

  // The ‹ › arrows move one month back or forward (and across years).
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
        <Reveal slide={false} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 60 }}>
          <YearCalendarGrid year={year} today={now} onSelectMonth={(m) => { setMonth0(m); setView('month'); }} />
        </ScrollView>
        </Reveal>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 60, gap: 24 }}>
          {/* The month card fades in again each time you move to another month. */}
          <Reveal key={format(first, 'yyyy-MM')} slide={false} style={{ marginHorizontal: screenMargin, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 6, paddingVertical: 4, marginBottom: 4 }}>
              <Text style={[type.headingH2, { flex: 1, color: colors.text.primary }]}>{format(first, 'MMMM yyyy')}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <RoundButton size={36} iconSize={20} icon="chevronLeft" label="Previous month" onPress={() => shiftMonth(-1)} />
                <RoundButton size={36} iconSize={20} icon="chevronRight" label="Next month" onPress={() => shiftMonth(1)} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
              {WEEKDAYS.map((d) => <Text key={d} style={[type.calendarWeekday, { flex: 1, textAlign: 'center', color: colors.text.secondary }]}>{d}</Text>)}
            </View>
            {weeks.map((week, i) => (
              <View key={i} style={{ flexDirection: 'row', borderTopWidth: stroke.hairline, borderColor: colors.border.subtle }}>
                {/* Each day: today gets a dark circle; a feast day shows the saint's picture and opens their novena. */}
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
          </Reveal>

          {feasts.length > 0 ? (
            <Reveal key={`feasts-${format(first, 'yyyy-MM')}`} index={1} slide={false} style={{ gap: 10 }}>
              <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.secondary, paddingHorizontal: screenMargin }]}>{strings.calendar.feastsThisMonth}</Text>
              <View style={{ marginHorizontal: screenMargin, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, overflow: 'hidden' }}>
                {feasts.map((f, i) => (
                  <View key={f.saint.id} style={{ borderTopWidth: i ? stroke.hairline : 0, borderColor: colors.border.subtle }}>
                    <FeastDateRow saintName={f.saint.name} avatar={f.saint.avatar} feastDate={f.feastDate} startDate={f.startDate}
                      onPress={() => f.novena && router.push(`/novena/${f.novena.id}`)} />
                  </View>
                ))}
              </View>
            </Reveal>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
