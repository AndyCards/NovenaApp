// Reader, Figma Page 34 "Reader · Day 1" (1227:57554) and its menu, intention and "Take a pause?" pop-ups.
// Source Serif 4 is used only on Reader screens. Audio never starts by itself.
// Where the person is in the prayer (day, scroll, audio) is saved quietly and restored when they come back.
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { AudioDock } from '@/components/audio/AudioDock';
import { Icon } from '@/components/Icon';
import { GentleExitCard } from '@/components/overlays/GentleExitCard';
import { PopupCard } from '@/components/overlays/PopupCard';
import { ReaderOptionsMenu } from '@/components/overlays/ReaderOptionsMenu';
import { ChapterTitle } from '@/components/reader/ChapterTitle';
import { PrayerPassage } from '@/components/reader/PrayerPassage';
import { colors, screenMargin } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { getDownload, getIntention, getMeta, setIntention, setMeta } from '@/data/queries';
import { clearPrayerProgress, getPrayerProgress, savePrayerProgress } from '@/data/prayerProgress';
import { useAudio } from '@/hooks/useAudio';
import { useGentleExit } from '@/hooks/useGentleExit';
import type { PrayerProgress } from '@/utils/pauseRules';
import { DUMMY_INTENTIONS, DUMMY_INTENTION_TEXTS, PLACEHOLDER_AUDIO } from '@/constants/config';
import { PressableScale } from '@/motion/PressableScale';
import { Reveal } from '@/motion/Reveal';
import { pressScale } from '@/motion/tokens';
import { usePlayerStore } from '@/state/playerStore';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';
import { markPrayed } from '@/hooks/useMarkPrayed';
import { downloadNovenaAudio, removeDownload } from '@/utils/downloads';
import type { DownloadStatus } from '@/utils/downloadStatus';
import { haptics } from '@/motion/haptics';

function NavButton({ icon, label, onPress }: { icon: 'back' | 'more'; label: string; onPress: () => void }) {
  return (
    <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} />
    </PressableScale>
  );
}

export default function Reader() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
  const { catalog, novenaById } = useCatalog();
  const lib = useLibrary();
  const audio = useAudio();
  // "preview~<novenaId>" means the person is reading a day of a novena they have NOT started: read-only,
  // nothing is saved, nothing can be marked as prayed, and no streak is counted.
  const preview = !!runId?.startsWith('preview~');
  const run = preview ? undefined : lib.runs.find((r) => r.id === runId);
  const novena = preview ? novenaById(runId!.slice('preview~'.length)) : run ? novenaById(run.novenaId) : undefined;
  const dayNo = Number(day);
  const [intentionText, setIntentionText] = useState(''); // what is saved
  const [editFocus, setEditFocus] = useState(false); // true only when the person tapped to edit, so the keyboard stays away otherwise
  const finishing = useRef(false); // true while "Mark as prayed" is saving
  const lastDay = useRef(dayNo); // the day shown before this one, to know which way to slide
  const [draft, setDraft] = useState(''); // what is being typed, saved only on "Save intention"
  // Which pop-up is open right now: the … menu or the intention (view or edit). "Take a pause?" is handled by useGentleExit below.
  const [popup, setPopup] = useState<'none' | 'menu' | 'intention-view' | 'intention-edit'>('none');
  const [download, setDownload] = useState<DownloadStatus>({ kind: 'none' });

  // ---- Where the person is in the prayer ----
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scroll = useRef({ y: 0, viewH: 0, contentH: 0 }); // current scroll position and sizes, to save and to measure progress
  const saved = useRef<PrayerProgress | null>(null); // progress saved last time for this day, if any
  const restoreY = useRef(0); // scroll position still to restore once the prayer has laid out
  const dayDone = useRef(false); // set once the day is marked prayed, so nothing in-progress is saved after that
  const isPrayed = !!run?.prayedDays.includes(dayNo);

  // Saves day, scroll and audio position silently. Never marks the day prayed or missed: that only happens on "Mark as prayed".
  const saveProgress = async () => {
    if (!run || preview || dayDone.current || run.prayedDays.includes(dayNo)) return;
    const { y, viewH, contentH } = scroll.current;
    const player = usePlayerStore.getState();
    const audioSec = player.state !== 'hidden' && player.novenaId === run.novenaId && player.day === dayNo ? player.positionSec : 0;
    try {
      await savePrayerProgress(run.id, { day: dayNo, scrollY: Math.round(y), readFraction: contentH > 0 ? Math.min(1, (y + viewH) / contentH) : 0, audioSec, savedAt: Date.now() });
    } catch { /* saving is best-effort; it must never interrupt prayer */ }
  };

  // "Take a pause?": only when Back (or swipe back) is used after real time in the prayer, and never once the day is prayed.
  const exit = useGentleExit({ enabled: !!run && !preview && !isPrayed, resetKey: dayNo, onSave: saveProgress });
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    scroll.current = { y: contentOffset.y, viewH: layoutMeasurement.height, contentH: contentSize.height };
    exit.onScroll(e);
  };

  // Opening a day: look up where the person left off in it last time (scroll and audio).
  useEffect(() => {
    saved.current = null;
    restoreY.current = 0;
    scroll.current = { y: 0, viewH: 0, contentH: 0 };
    if (!runId || preview) return;
    let cancelled = false;
    getPrayerProgress(runId, dayNo).then((p) => {
      if (cancelled || !p) return;
      saved.current = p;
      restoreY.current = p.scrollY;
      if (p.scrollY > 0) scrollRef.current?.scrollTo({ y: p.scrollY, animated: false }); // if the prayer is already laid out
      // Audio: if the player was closed since, open it again paused at the saved spot. (If it's still open it kept its place.)
      const st = usePlayerStore.getState();
      if (novena && p.audioSec > 0 && st.novenaId === novena.id && st.day === dayNo && st.positionSec === 0 && st.state === 'paused') {
        audio.open(novena.id, novena.title, dayNo, p.audioSec);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [runId, dayNo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the person's saved intention, and whether this novena's audio is already downloaded.
  useEffect(() => {
    if (!runId || preview) return;
    (async () => {
      let text = await getIntention(runId);
      // Testing aid: save a sample intention once per novena run, so the intention pop-up has something to show.
      if (DUMMY_INTENTIONS && !text && !(await getMeta(`dummy-intention-${runId}`))) {
        text = DUMMY_INTENTION_TEXTS[Math.abs([...runId].reduce((h, c) => h + c.charCodeAt(0), 0)) % DUMMY_INTENTION_TEXTS.length];
        await setIntention(runId, text);
        await setMeta(`dummy-intention-${runId}`, '1');
      }
      setIntentionText(text);
    })();
  }, [runId]);
  useEffect(() => {
    if (novena) getDownload(novena.id).then((d) => setDownload(d?.status === 'complete' ? { kind: 'done' } : { kind: 'none' }));
  }, [novena?.id]);
  // Leaving the Reader does NOT stop the audio: the small player bar stays at the bottom of every screen
  // (see GlobalAudioDock), so it can always be paused or closed from wherever you are.
  // Moving to another day closes the previous day's audio. While placeholder audio is on, the player bar then
  // appears for the new day, paused (it never starts by itself).
  useEffect(() => {
    if (!novena) return;
    const st = usePlayerStore.getState();
    if (st.state !== 'hidden' && st.novenaId === novena.id && st.day === dayNo) return; // already showing this day
    if (st.state !== 'hidden') audio.close();
    if (PLACEHOLDER_AUDIO) audio.open(novena.id, novena.title, dayNo, saved.current?.day === dayNo ? saved.current.audioSec : 0);
  }, [novena?.id, dayNo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!novena || (!run && !preview)) return null;
  const content = novena.days.find((d) => d.day === dayNo);
  if (!content) return null;
  const alreadyPrayed = isPrayed;
  // A day that isn't due yet can be read, but not marked as prayed.
  const notYet = !!run && lib.stateOf(run, dayNo) === 'upcoming';
  const close = () => setPopup('none');
  // Going to a later day, the prayer slides in gently from the right; to an earlier day, from the left.
  const slideFrom = lastDay.current === dayNo ? 0 : dayNo > lastDay.current ? 28 : -28;
  lastDay.current = dayNo;

  // "Mark Day N as prayed": save it, refresh, then show the "Day N marked as prayed" screen.
  // A quick double tap only counts once.
  // The in-progress bookmark for this day is cleared, and "Take a pause?" is switched off so the prayed screen opens directly.
  const finish = async () => {
    if (!run || finishing.current) return;
    finishing.current = true;
    try {
      await markPrayed(run.id, dayNo, run.startedOn, run.prayedDays);
      dayDone.current = true;
      await clearPrayerProgress(run.id).catch(() => {});
      haptics.success(); // one calm double-tap: the day is done
      exit.allowLeave();
      router.replace(`/prayed/${run.id}/${dayNo}`);
    } finally {
      finishing.current = false;
    }
  };
  // No intention written yet? Open the box to write one. Otherwise show it.
  const openIntention = () => { setEditFocus(false); setDraft(intentionText); setPopup(intentionText.trim() ? 'intention-view' : 'intention-edit'); };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.surface.default }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: screenMargin + 2, paddingVertical: 6 }}>
        {/* Back leaves. After real time in an unprayed day, useGentleExit holds it and asks "Take a pause?" first. … opens the menu (never the pause card). */}
        <NavButton icon="back" label={strings.common.back} onPress={() => router.back()} />
        <NavButton icon="more" label={strings.common.more} onPress={() => setPopup('menu')} />
      </View>

      <Reveal key={dayNo} slide={false} fromX={slideFrom} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={64}
          // Once the prayer has laid out, jump (without animation) to where the person left off.
          onContentSizeChange={(_, h) => {
            if (restoreY.current > 0 && h > restoreY.current) { scrollRef.current?.scrollTo({ y: restoreY.current, animated: false }); restoreY.current = 0; }
          }}
          contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 22, gap: 24, paddingBottom: 72 }}>
          {/* "Day 1 of 9" with the cross, then the prayer itself, then the mark-as-prayed button. */}
          <ChapterTitle title={strings.reader.dayOf(dayNo, novena.days.length)} />
          <PrayerPassage blocks={content.blocks} onViewIntention={openIntention} />
          {/* Preview: instead of "Mark as prayed", offer to start the novena (then this same day opens for real). */}
          {preview ? (
            <Button label={strings.novena.start} icon="handsPraying" onPress={async () => { const id = await lib.start(novena.id); router.replace(`/reader/${id}/${dayNo}`); }} />
          ) : <Button label={alreadyPrayed ? strings.novena.prayedDay(dayNo) : strings.reader.markPrayed(dayNo)} icon="handsPraying" disabled={alreadyPrayed || notYet} onPress={finish} />}
        </ScrollView>
        {/* Soft white fades at the top and bottom edges so text gently disappears as you scroll. */}
        <LinearGradient pointerEvents="none" colors={['#FFFFFF', 'rgba(255,255,255,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12 }} />
        <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46 }} />
      </Reveal>
      {/* The audio player appears here only after the person chooses Listen. It never plays by itself. */}
      <AudioDock inline />

      {/* The … menu: change day, Listen / Read only, save, download, share, view intention. */}
      <ReaderOptionsMenu
        visible={popup === 'menu'}
        day={dayNo}
        total={novena.days.length}
        mode={audio.state !== 'hidden' && audio.novenaId === novena.id ? 'listen' : 'read'}
        saved={lib.isSaved(novena.id)}
        download={download}
        sizeMb={novena.audioSizeMb}
        hasAudio={novena.hasAudio}
        canListen={novena.hasAudio || PLACEHOLDER_AUDIO}
        onClose={close}
        onChangeDay={(d) => router.setParams({ day: String(d) })}
        onMode={(m) => { if (m === 'listen') audio.open(novena.id, novena.title, dayNo, saved.current?.audioSec ?? 0); else audio.close(); close(); }}
        onToggleSave={() => (lib.isSaved(novena.id) ? lib.unsave(novena.id) : lib.save(novena.id))}
        onDownload={async () => {
          setDownload({ kind: 'downloading', pct: 0 });
          try {
            await downloadNovenaAudio(novena.id, novena.days.map((d) => d.day), catalog.version, (pct) => setDownload({ kind: 'downloading', pct }));
            setDownload({ kind: 'done' });
          } catch { setDownload({ kind: 'failed' }); }
        }}
        onRemoveDownload={async () => { await removeDownload(novena.id); setDownload({ kind: 'none' }); }}
        onShare={() => { close(); router.push(`/share/${novena.id}`); }}
        onViewIntention={openIntention}
        hideIntention={preview}
      />
      {/* "Take a pause?": Keep praying / X / tap outside stay right here; Leave saves and goes back. */}
      <GentleExitCard context="prayer" visible={exit.visible} onStay={exit.stay} onLeave={exit.leave} />
      <PopupCard type="intention-view" visible={popup === 'intention-view'} onClose={close} novenaTitle={`${novena.title} Novena`} value={intentionText} onEdit={() => { setEditFocus(true); setDraft(intentionText); setPopup('intention-edit'); }} />
      <PopupCard
        type="intention-edit"
        visible={popup === 'intention-edit'}
        onClose={close}
        novenaTitle={`${novena.title} Novena`}
        value={draft}
        onChange={setDraft}
        focus={editFocus}
        // The intention stays on this phone. It is never uploaded or shared.
        onSave={async () => {
          if (!run) return;
          const text = draft.trim();
          await setIntention(run.id, text);
          setIntentionText(text);
          setPopup(text ? 'intention-view' : 'none');
        }}
      />
    </SafeAreaView>
  );
}
