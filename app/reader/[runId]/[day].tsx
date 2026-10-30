// Reader: one day's prayer. Source Serif 4 is used only on this screen.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { AudioDock } from '@/components/audio/AudioDock';
import { NavBar } from '@/components/navigation/NavBar';
import { AlertCard, type AlertKind } from '@/components/overlays/AlertCard';
import { PopupCard } from '@/components/overlays/PopupCard';
import { ChapterTitle } from '@/components/reader/ChapterTitle';
import { DayStepper } from '@/components/reader/DayStepper';
import { PrayerPassage } from '@/components/reader/PrayerPassage';
import { colors, screenMargin } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { getIntention, setIntention } from '@/data/queries';
import { useAudio } from '@/hooks/useAudio';
import { useCatalog } from '@/hooks/useCatalog';
import { markPrayed } from '@/hooks/useMarkPrayed';
import { useRuns } from '@/hooks/useNovenaRun';

export default function Reader() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
  const { novenaById } = useCatalog();
  const { runs, refresh } = useRuns();
  const audio = useAudio();
  const run = runs.find((r) => r.id === runId);
  const novena = run ? novenaById(run.novenaId) : undefined;
  const dayNo = Number(day);
  const [intentionText, setIntentionText] = useState('');
  const [showIntention, setShowIntention] = useState(false);
  const [alert, setAlert] = useState<AlertKind | null>(null);

  useEffect(() => { if (runId) getIntention(runId).then(setIntentionText); }, [runId]);
  if (!run || !novena) return null;
  const content = novena.days.find((d) => d.day === dayNo);
  if (!content) return null;
  const alreadyPrayed = run.prayedDays.includes(dayNo);

  const finish = async () => {
    const { completed } = await markPrayed(run.id, dayNo, run.startedOn, run.prayedDays);
    await refresh();
    if (completed) setAlert({ kind: 'complete', novenaTitle: novena.title });
    else router.replace('/library');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar
        title={novena.title}
        onBack={() => (alreadyPrayed ? router.back() : setAlert({ kind: 'prayAnother', title: 'Continue another time?', body: 'Your place is saved. Day ' + dayNo + ' stays here for you.', confirmLabel: 'Leave' }))}
        secondaryAction={novena.hasAudio ? { icon: 'play', label: 'Listen', onPress: () => audio.open(novena.id, novena.title, dayNo) } : undefined}
      />
      <ScrollView contentContainerStyle={{ padding: screenMargin, paddingBottom: 200, gap: 16 }}>
        <DayStepper day={dayNo} total={novena.days.length} onChange={(d) => router.setParams({ day: String(d) })} />
        <ChapterTitle title={content.title} meta={strings.reader.dayOf(dayNo, novena.days.length)} />
        <PrayerPassage blocks={content.blocks} onViewIntention={() => setShowIntention(true)} />
        <Button label={alreadyPrayed ? strings.novena.prayedDay(dayNo) : strings.reader.markPrayed(dayNo)} disabled={alreadyPrayed} onPress={finish} />
      </ScrollView>
      <AudioDock />

      <PopupCard
        type="intention-edit"
        visible={showIntention}
        onClose={() => setShowIntention(false)}
        novenaTitle={novena.title}
        value={intentionText}
        onChange={setIntentionText}
        // The intention stays on this phone. It is never uploaded or shared.
        onSave={async () => { await setIntention(run.id, intentionText); setShowIntention(false); }}
      />
      <AlertCard
        alert={alert}
        onClose={() => { setAlert(null); if (alert?.kind === 'complete') router.replace('/library'); }}
        onPrimary={() => { setAlert(null); router.replace('/library'); }}
        onSecondary={() => { if (alert?.kind === 'complete') router.push(`/share/${novena.id}`); }}
      />
    </SafeAreaView>
  );
}
