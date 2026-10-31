// Novena page, Figma Page 34 "Novena page · Pray Day 4" (1227:62829).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/actions/ActionBar';
import { IconButton } from '@/components/actions/IconButton';
import { Icon } from '@/components/Icon';
import { NovenaImage } from '@/components/content/NovenaImage';
import { NovenaMetaRow } from '@/components/content/NovenaMetaRow';
import { NovenaDayRow } from '@/components/reader/NovenaDayRow';
import { colors, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';

export default function NovenaPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { novenaById } = useCatalog();
  const lib = useLibrary();
  const [daysOpen, setDaysOpen] = useState(true);
  const busy = useRef(false); // stops a double tap from starting the novena twice
  const novena = novenaById(id);
  if (!novena) return null;
  // Is this novena already being prayed? That decides the button: Start, Pray Day N, or Continue with Day N.
  const run = lib.runs.find((r) => r.novenaId === id && (r.status === 'active' || r.status === 'paused'));

  // No run yet: "Start Novena". Missed days: "Continue with Day N". Otherwise: "Pray Day N".
  const label = !run ? strings.novena.start : run.missed.length > 0 ? strings.novena.continueDay(run.continueDay) : strings.novena.prayDay(run.continueDay);
  // Opening any day starts the novena first if it hasn't been started yet.
  const openDay = async (day: number) => {
    if (busy.current || !lib.loaded) return; // wait until we know whether it's already started
    busy.current = true;
    try {
      if (run?.status === 'paused') await lib.resume(run.id); // opening a paused novena picks it up again
      const runId = run?.id ?? (await lib.start(novena.id));
      router.push(`/reader/${runId}/${day}`);
    } finally {
      busy.current = false;
    }
  };
  const saved = lib.isSaved(novena.id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: screenMargin, paddingVertical: 6 }}>
        {/* Top row: Back on the left, Share on the right. */}
        <IconButton icon="back" label="Back" size="large" onPress={() => router.back()} />
        <IconButton icon="share" label="Share" size="large" onPress={() => router.push(`/share/${novena.id}`)} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ paddingHorizontal: screenMargin }}>
          {/* The big saint picture (cropped from the top so heads are never cut off). */}
          <NovenaImage image={novena.image} size="full" label={novena.title} style={{ width: width - screenMargin * 2, height: 403, borderRadius: radius.s }} />
        </View>
        <View style={{ paddingHorizontal: screenMargin + 2, paddingVertical: 6, marginTop: 6, gap: 20 }}>
          <View style={{ gap: 6 }}>
            <Text accessibilityRole="header" style={[type.headingH2, { color: colors.text.body, textTransform: 'capitalize' }]}>{novena.title}</Text>
            <NovenaMetaRow minutes={novena.minutesPerDay} tags={novena.tags} />
          </View>
          {/* Save (bookmark) and the main dark pray button. */}
          <ActionBar primaryLabel={label} onPrimary={() => openDay(run?.continueDay ?? 1)} saved={saved}
            onToggleSave={() => (saved ? lib.unsave(novena.id) : lib.save(novena.id))} />
          <Text style={[type.bodyMedium, { color: colors.text.body }]}>{novena.about}</Text>
        </View>
        {/* "Novena Days" heading. Tap it to fold or unfold the list of nine days. */}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: daysOpen }} onPress={() => setDaysOpen((o) => !o)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: screenMargin, paddingVertical: 6, marginTop: 14 }}>
          <Text style={[type.titleMedium, { color: colors.text.secondary }]}>{strings.novena.days}</Text>
          <Icon name={daysOpen ? 'chevronDown' : 'chevronRight'} size={22} color={colors.text.secondary} />
        </Pressable>
        {daysOpen ? (
          <View style={{ padding: screenMargin, gap: 8 }}>
            {/* One card per day, with a marker showing prayed, today, missed or still to come. */}
            {novena.days.map((d) => (
              <NovenaDayRow
                key={d.day}
                day={d.day}
                title={d.title}
                meta={d.day === 1 ? `${strings.novena.startHere} · ${strings.novena.minutes(novena.minutesPerDay)}` : strings.novena.minutes(novena.minutesPerDay)}
                state={run ? lib.stateOf(run, d.day) : 'upcoming'}
                onPress={() => openDay(d.day)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
