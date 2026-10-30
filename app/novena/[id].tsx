// Novena page: description, nine days, start / continue.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/actions/ActionBar';
import { NovenaImage } from '@/components/content/NovenaImage';
import { NovenaMetaRow } from '@/components/content/NovenaMetaRow';
import { NavBar } from '@/components/navigation/NavBar';
import { NovenaDayRow } from '@/components/reader/NovenaDayRow';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';

export default function NovenaPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { novenaById, saintById } = useCatalog();
  const lib = useLibrary();
  const novena = novenaById(id);
  if (!novena) return null;
  const run = lib.runs.find((r) => r.novenaId === id && (r.status === 'active' || r.status === 'paused'));
  const saint = saintById(novena.saintId);

  const primary = async () => {
    const runId = run?.id ?? (await lib.start(novena.id));
    router.push(`/reader/${runId}/${run?.continueDay ?? 1}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar title={novena.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <NovenaImage image={novena.image} size="full" label={novena.title} style={{ width: '100%', height: 300 }} />
        <View style={{ padding: screenMargin, gap: 8 }}>
          <Text style={[type.headingH2, { color: colors.text.primary }]}>{novena.title}</Text>
          {saint ? <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{saint.name}</Text> : null}
          <NovenaMetaRow minutes={novena.minutesPerDay} tags={novena.tags} />
          <Text style={[type.bodyLarge, { color: colors.text.body }]}>{novena.about}</Text>
        </View>
        <Text style={[type.titleSection, { color: colors.text.primary, paddingHorizontal: screenMargin }]}>{strings.novena.days}</Text>
        {novena.days.map((d) => (
          <NovenaDayRow
            key={d.day}
            day={d.day}
            title={d.title}
            meta={strings.novena.minutes(novena.minutesPerDay)}
            state={run ? lib.stateOf(run, d.day) : 'upcoming'}
            onPress={async () => {
              const runId = run?.id ?? (await lib.start(novena.id));
              router.push(`/reader/${runId}/${d.day}`);
            }}
          />
        ))}
      </ScrollView>
      <ActionBar
        primaryLabel={run ? strings.novena.continueDay(run.continueDay) : strings.novena.start}
        onPrimary={primary}
        actions={[{ icon: 'bookmark', label: 'Save', onPress: () => (lib.isSaved(novena.id) ? lib.unsave(novena.id) : lib.save(novena.id)) }]}
      />
    </SafeAreaView>
  );
}
