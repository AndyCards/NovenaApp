// Home (Discover): continue card, how it works, feast days, novenas.
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioDock } from '@/components/audio/AudioDock';
import { ContinueCard } from '@/components/content/ContinueCard';
import { FeastDayItem } from '@/components/content/FeastDayItem';
import { HowItWorksCard } from '@/components/content/HowItWorksCard';
import { NovenaCard } from '@/components/content/NovenaCard';
import { SectionHeader } from '@/components/content/SectionHeader';
import { SearchField } from '@/components/inputs/SearchField';
import { colors, screenMargin } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { useRuns } from '@/hooks/useNovenaRun';
import { todayString } from '@/utils/dateUtils';
import { upcomingFeasts } from '@/utils/feasts';

export default function Home() {
  const router = useRouter();
  const { catalog, novenaById } = useCatalog();
  const { runs } = useRuns();
  const current = runs.find((r) => r.status === 'active');
  const currentNovena = current ? novenaById(current.novenaId) : undefined;
  const feasts = upcomingFeasts(catalog, todayString());
  const featured = catalog.novenas.filter((n) => n.featured).sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140, gap: 12 }}>
        <View style={{ paddingHorizontal: screenMargin }}>
          <SearchField value="" onChangeText={() => {}} onSubmit={(q) => router.push({ pathname: '/search', params: { q } })} />
        </View>
        {current && currentNovena ? (
          <ContinueCard
            novena={currentNovena}
            day={current.continueDay}
            missed={current.missed.length}
            onOpen={() => router.push(`/novena/${currentNovena.id}`)}
            onContinue={() => router.push(`/reader/${current.id}/${current.continueDay}`)}
          />
        ) : (
          <HowItWorksCard />
        )}
        {feasts.length > 0 && (
          <>
            <SectionHeader title={strings.home.feastTitle} subtitle={strings.home.feastSubtitle} onSeeAll={() => router.push('/calendar')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: screenMargin, gap: 10 }}>
              {feasts.map((f) => (
                <FeastDayItem key={f.saint.id} saintName={f.saint.name} avatar={f.saint.avatar} feastDate={f.feastDate} onPress={() => router.push('/calendar')} />
              ))}
            </ScrollView>
          </>
        )}
        <SectionHeader title="Novenas" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: screenMargin, gap: 10 }}>
          {(featured.length ? featured : catalog.novenas).map((n) => (
            <NovenaCard key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />
          ))}
        </ScrollView>
      </ScrollView>
      <AudioDock />
    </SafeAreaView>
  );
}
