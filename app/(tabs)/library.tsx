// Library: Active / Completed / Saved.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { ActiveNovenaCard } from '@/components/content/ActiveNovenaCard';
import { CompletedNovenaCard } from '@/components/content/CompletedNovenaCard';
import { SavedRow } from '@/components/content/SavedRow';
import { Icon, type IconName } from '@/components/Icon';
import { SegmentedControl } from '@/components/inputs/SegmentedControl';
import { AlertCard, type AlertKind } from '@/components/overlays/AlertCard';
import { CardMenu } from '@/components/overlays/CardMenu';
import { Toast } from '@/components/overlays/Toast';
import { colors, radius, screenMargin, stroke } from '@/constants/theme';
import { Reveal } from '@/motion/Reveal';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';
import { formatRange, todayString } from '@/utils/dateUtils';
import { dueDay } from '@/utils/dayRules';

type Tab = 'active' | 'completed' | 'saved';
const L = strings.library;

// Empty tab (Figma "Library · … empty"): a round icon, a title, two lines of text, and one grey button.
function Empty({ icon, title, body, cta, onPress }: { icon: IconName; title: string; body: string; cta: string; onPress: () => void }) {
  return (
    <Reveal style={{ alignItems: 'center', paddingTop: 86, paddingHorizontal: 10, gap: 20 }}>
      <LinearGradient colors={colors.gradient.iconCircle} style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={colors.text.secondary} />
      </LinearGradient>
      <View style={{ gap: 8, alignItems: 'center' }}>
        <Text style={[type.labelLarge, { color: colors.text.secondary, textAlign: 'center' }]}>{title}</Text>
        <Text style={[type.bodyMedium, { lineHeight: 22, color: colors.text.secondary, textAlign: 'center' }]}>{body}</Text>
      </View>
      <Button label={cta} variant="secondary" onPress={onPress} style={{ alignSelf: 'stretch' }} />
    </Reveal>
  );
}

export default function Library() {
  const router = useRouter();
  const { novenaById } = useCatalog();
  const lib = useLibrary();
  const [tab, setTab] = useState<Tab>('active');
  const [menuRun, setMenuRun] = useState<string | null>(null);
  const [menuY, setMenuY] = useState(0); // where the "..." button sits on screen, so the menu opens under it
  const [alert, setAlert] = useState<AlertKind | null>(null);
  const [toast, setToast] = useState<{ message: string; undo: () => void } | null>(null);
  // Which novena's "…" menu is open, and the pop-up / undo message being shown (if any).
  const run = lib.runs.find((r) => r.id === menuRun);
  // True when today's day of this novena has already been prayed (the button then turns light with a tick).
  const prayedToday = (r: { startedOn: string; prayedDays: number[] }) => r.prayedDays.includes(dueDay(r.startedOn, todayString()));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ paddingHorizontal: screenMargin, paddingTop: 8, paddingBottom: 16 }}>
        {/* The Active / Completed / Saved switch at the top, with how many are in each. */}
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { key: 'active', label: L.active, count: lib.active.length },
            { key: 'completed', label: L.completed, count: lib.completed.length },
            { key: 'saved', label: L.saved, count: lib.saved.length },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: screenMargin, paddingBottom: 140, gap: 12 }}>
        {/* Active tab: one card per novena being prayed. Empty? A friendly message and a button to find one. */}
        {tab === 'active' && (lib.active.length === 0
          ? <Empty icon="bookOpen" title={L.emptyActiveTitle} body={L.emptyActiveBody} cta={L.emptyActiveCta} onPress={() => router.push('/')} />
          : lib.active.map((r, i) => {
              const n = novenaById(r.novenaId);
              return n && (
                <Reveal key={r.id} index={i} list>
                <ActiveNovenaCard novena={n} paused={r.status === 'paused'}
                  day={prayedToday(r) ? dueDay(r.startedOn, todayString()) : r.continueDay}
                  prayedToday={prayedToday(r)}
                  onOpen={() => router.push(`/novena/${n.id}`)}
                  onPray={() => (prayedToday(r) ? router.push(`/novena/${n.id}`) : router.push(`/reader/${r.id}/${r.continueDay}`))}
                  onMenu={(y) => { setMenuY(y); setMenuRun(r.id); }} />
                </Reveal>
              );
            }))}
        {/* Completed tab: finished novenas with their dates and "Pray it again". */}
        {tab === 'completed' && (lib.completed.length === 0
          ? <Empty icon="checkCircle" title={L.emptyCompletedTitle} body={L.emptyCompletedBody} cta={L.emptyCompletedCta} onPress={() => setTab('active')} />
          : lib.completed.map((r, i) => {
              const n = novenaById(r.novenaId);
              return n && (
                <Reveal key={r.id} index={i} list>
                <CompletedNovenaCard novena={n} prayedRange={formatRange(r.startedOn, r.completedOn ?? r.startedOn)}
                  onOpen={() => router.push(`/novena/${n.id}`)}
                  onPrayAgain={() => { setMenuRun(r.id); setAlert({ kind: 'prayAgain' }); }} />
                </Reveal>
              );
            }))}
        {/* Saved tab: novenas saved for later, in one card. Tap the bookmark to unsave (with Undo). */}
        {tab === 'saved' && (lib.saved.length === 0
          ? <Empty icon="bookmark" title={L.emptySavedTitle} body={L.emptySavedBody} cta={L.emptySavedCta} onPress={() => router.push('/')} />
          : (
            <Reveal style={{ borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, overflow: 'hidden' }}>
              {lib.saved.map((id, i) => {
                const n = novenaById(id);
                return n && (
                  <View key={id}>
                    {i > 0 ? <View style={{ height: stroke.hairline, backgroundColor: colors.border.subtle }} /> : null}
                    <SavedRow novena={n} onPress={() => router.push(`/novena/${id}`)}
                      onUnsave={async () => { await lib.unsave(id); setToast({ message: L.removedFromSaved, undo: () => lib.undoUnsave(id) }); }} />
                  </View>
                );
              })}
            </Reveal>
          ))}
      </ScrollView>

      {/* The "…" menu on an active novena: pause or resume, start again, or remove. */}
      <CardMenu
        visible={!!menuRun && !alert}
        anchorBottom={menuY}
        paused={run?.status === 'paused'}
        onClose={() => setMenuRun(null)}
        onPause={async () => { await lib.pause(menuRun!); setMenuRun(null); }}
        onResume={async () => { await lib.resume(menuRun!); setMenuRun(null); }}
        onRestart={() => setAlert({ kind: 'prayAgain' })}
        onRemove={() => setAlert({ kind: 'remove' })}
      />
      {/* Confirmation pop-ups ("Start again?", "Remove novena?") and what happens when you agree. */}
      <AlertCard
        alert={alert}
        onClose={() => { setAlert(null); setMenuRun(null); }}
        // "Remove novena?": the dark button is "Keep praying" (just closes); "Stop novena" removes it, with Undo.
        // "Start again?": the dark button starts a fresh run from Day 1 and ends the old one.
        onPrimary={async () => {
          if (run && alert?.kind === 'prayAgain') {
            if (run.status === 'active' || run.status === 'paused') await lib.end(run.id);
            const newId = await lib.start(run.novenaId, run.id);
            router.push(`/reader/${newId}/1`);
          }
          setAlert(null); setMenuRun(null);
        }}
        onSecondary={async () => {
          if (run && alert?.kind === 'remove') {
            const id = run.id;
            await lib.quit(id);
            setToast({ message: L.novenaRemoved, undo: () => lib.undoQuit(id) });
          }
          setAlert(null); setMenuRun(null);
        }}
      />
      {toast && <Toast message={toast.message} onUndo={() => { toast.undo(); setToast(null); }} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  );
}
