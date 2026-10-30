// Calendar: year of months, plus this month's feast days.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeastDateRow } from '@/components/content/FeastDateRow';
import { SectionHeader } from '@/components/content/SectionHeader';
import { NavBar } from '@/components/navigation/NavBar';
import { MonthCard } from '@/components/calendar/MonthCard';
import { colors, screenMargin } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { formatMonthDay } from '@/utils/dateUtils';
import { feastsInMonth } from '@/utils/feasts';

export default function CalendarScreen() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const now = new Date();
  const year = now.getFullYear();
  const feasts = feastsInMonth(catalog, year, now.getMonth() + 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar title={strings.calendar.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140, gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: screenMargin }}>
          {Array.from({ length: 12 }, (_, m) => (
            <MonthCard key={m} year={year} month0={m} current={m === now.getMonth()} todayDay={m === now.getMonth() ? now.getDate() : undefined} onPress={() => {}} />
          ))}
        </View>
        <SectionHeader title={strings.calendar.feastsThisMonth} />
        {feasts.map((f) => (
          <FeastDateRow key={f.saint.id} saintName={f.saint.name} avatar={f.saint.avatar} feastDate={formatMonthDay(f.feastDate)} startDate={strings.calendar.novenaStarts(formatMonthDay(f.startDate))}
            onPress={() => f.novena && router.push(`/novena/${f.novena.id}`)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
