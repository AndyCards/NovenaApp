// Reader, Figma Page 34 "Reader · Day 1" (1227:57554) and its menu, intention and "Take a pause?" pop-ups.
// Source Serif 4 is used only on Reader screens. Audio never starts by itself.
// How you get here: Start Novena / Pray Day N / Continue (novena page, Home, Library) or a day row on the novena page.
// The address is /reader/<run id>/<day>; for a novena not started yet it is /reader/preview~<novena id>/<day> (read only).
// From here: "Mark as prayed" swaps this screen for "Day N marked as prayed"; the … menu can change day (same screen,
// new day number in the address), and Back may first ask "Take a pause?" (only after real time in an unprayed day).
// Where the person is in the prayer (scroll and audio) is saved quietly and restored when they come back.
// While audio plays, the paragraph being read is highlighted and gently kept in view ("follow-along",
// see useNarrationHighlight and useFollowAlong).
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { format, parseISO } from 'date-fns';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { AudioDock } from '@/components/audio/AudioDock';
import { GentleExitCard } from '@/components/overlays/GentleExitCard';
import { PopupCard } from '@/components/overlays/PopupCard';
import { ReaderOptionsMenu } from '@/components/overlays/ReaderOptionsMenu';
import { ChapterTitle } from '@/components/reader/ChapterTitle';
import { PrayerPassage } from '@/components/reader/PrayerPassage';
import { colors, gradients } from '@/constants/theme';
import { type } from '@/constants/typography';
import { addDaysTo, todayString } from '@/utils/dateUtils';
import { strings } from '@/copy/strings';
import { getDownload, getIntention, getMeta, setIntention, setMeta } from '@/data/queries';
import { clearPrayerProgress, getPrayerProgress, savePrayerProgress } from '@/data/prayerProgress';
import { audioControls } from '@/hooks/useAudio';
import { useGentleExit } from '@/hooks/useGentleExit';
import type { PrayerProgress } from '@/utils/pauseRules';
import { useFollowAlong } from '@/hooks/useFollowAlong';
import { useNarrationHighlight } from '@/hooks/useNarrationHighlight';
import { testNarration } from '@/content/testNarration';
import { DUMMY_INTENTIONS, DUMMY_INTENTION_TEXTS, PLACEHOLDER_AUDIO } from '@/constants/config';
import { Reveal } from '@/motion/Reveal';
import { usePlayerStore } from '@/state/playerStore';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';
import { markPrayed } from '@/hooks/useMarkPrayed';
import { downloadNovenaAudio, removeDownload } from '@/utils/downloads';
import type { DownloadStatus } from '@/utils/downloadStatus';
import { haptics } from '@/motion/haptics';
import { novenaPageTitle } from '@/utils/novenaTitle';
import { NAV_BAR_HEIGHT, NavBar } from '@/components/navigation/NavBar';
import { useScrolled } from '@/hooks/useScrolled';

export default function Reader() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
  const { scrolled, onScroll } = useScrolled();
  const insets = useSafeAreaInsets(); // the glass nav bar floats over the page, so the content starts below it
  const { catalog, novenaById } = useCatalog();
  const lib = useLibrary();
  // The player's buttons only. This screen does not re-draw on every audio position update; the parts that
  // need the position (the player card, the highlighted paragraph) follow it themselves.
  const audio = audioControls;
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
  const [draft, setDraft] = useState(''); // what is being typed; it saves itself a moment after you stop typing
  // Which pop-up is open right now: the … menu or the intention (view or edit). "Take a pause?" is handled by useGentleExit below.
  const [popup, setPopup] = useState<'none' | 'menu' | 'intention-view' | 'intention-edit'>('none');
  const [download, setDownload] = useState<DownloadStatus>({ kind: 'none' });
  const dayContent = novena?.days.find((d) => d.day === dayNo);
  // Is the player open for this novena? (Decides "Listen" or "Read only" in the … menu.)
  const listening = usePlayerStore((s) => s.state !== 'hidden' && s.novenaId === novena?.id);
  const playing = usePlayerStore((s) => s.state === 'playing' && s.novenaId === novena?.id && s.day === dayNo);
  // Follow-along: which paragraph is being read aloud, and keeping it in view.
  const { activeIndex, active } = useNarrationHighlight(novena?.id, dayNo, dayContent?.blocks,
    dayContent?.audio?.cues ?? (PLACEHOLDER_AUDIO ? testNarration(novena?.id, dayNo)?.cues : undefined)); // testing voice, Day 1
  const follow = useFollowAlong(activeIndex, playing, `${novena?.id}-${dayNo}`);
  // An unchanging "view intention" handler, so the prayer text isn't re-drawn when this screen re-draws.
  const openIntentionRef = useRef<() => void>(() => {});
  const onViewIntention = useCallback(() => openIntentionRef.current(), []);

  // ---- Where the person is in the prayer ----
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
  const trackScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
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
      if (p.scrollY > 0) follow.scrollProps.ref.current?.scrollTo({ y: p.scrollY, animated: false }); // if the prayer is already laid out
      // Audio: if the player was reopened for this day at the start, move it (still paused) to the saved spot.
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
      // Testing aid switched off: clear a sample intention that was saved earlier (and never changed),
      // so novenas opened during testing also start empty and offer the "Your Intention" card.
      if (!DUMMY_INTENTIONS && DUMMY_INTENTION_TEXTS.includes(text) && (await getMeta(`dummy-intention-${runId}`))) {
        text = '';
        await setIntention(runId, '');
      }
      setIntentionText(text);
      // First visit to a brand-new novena: nothing written yet, so offer the empty "Your Intention" card once,
      // a moment after the prayer appears. Each novena you start has its own intention, so this happens once per novena.
      if (!text.trim() && !(await getMeta(`intention-offered-${runId}`))) {
        await setMeta(`intention-offered-${runId}`, '1');
        setTimeout(() => setPopup((cur) => (cur === 'none' ? 'intention-edit' : cur)), 600);
      }
    })();
  }, [runId]);
  // Auto-save: while the intention card is open, what is typed is stored a moment after the last key press.
  // The intention stays on this phone. It is never uploaded or shared.
  useEffect(() => {
    if (popup !== 'intention-edit' || !run) return;
    const text = draft.trim();
    if (text === intentionText) return;
    // The save must be awaited (or .then-ed): the database helper only writes when it is awaited. Without it the
    // text looked saved on screen but was never stored, so it vanished when the person left the prayer.
    const t = setTimeout(() => { setIntention(run.id, text).then(() => setIntentionText(text)); }, 400);
    return () => clearTimeout(t);
  }, [draft, popup]); // eslint-disable-line react-hooks/exhaustive-deps
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
  const content = dayContent;
  if (!content) return null;
  const alreadyPrayed = isPrayed;
  // A day that isn't due yet can be read, but not marked as prayed.
  const notYet = !!run && lib.stateOf(run, dayNo) === 'upcoming';
  // When that day can be marked (Andy, 2026-11-02): shown as a short line under the greyed-out button.
  const dueOn = run ? addDaysTo(run.startedOn, dayNo - 1) : '';
  const notYetWhen = !notYet ? '' : dueOn === addDaysTo(todayString(), 1) ? 'tomorrow' : `on ${format(parseISO(dueOn), 'EEEE d MMM')}`;
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
  openIntentionRef.current = openIntention;
  // Store what was written right away (no waiting for auto-save), then go back to the prayer.
  const saveIntentionAndClose = async () => {
    close();
    if (!run) return;
    const text = draft.trim();
    if (text !== intentionText) { await setIntention(run.id, text); setIntentionText(text); }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.surface.default }}>
      {/* Figma Nav Bar. Back leaves. After real time in an unprayed day, useGentleExit holds it and asks "Take a pause?" first.
          … opens the menu (never the pause card). */}
      <NavBar overlay scrolled={scrolled} backLabel={strings.common.back} onBack={() => router.back()}
        primaryAction={{ icon: 'more', label: strings.common.more, onPress: () => setPopup('menu') }} />

      <Reveal key={dayNo} slide={false} fromX={slideFrom} style={{ flex: 1 }}>
        <ScrollView {...follow.scrollProps} onScroll={(e) => { follow.scrollProps.onScroll(e); onScroll(e); trackScroll(e); }}
          // Once the prayer has laid out, jump (without animation) to where the person left off.
          onContentSizeChange={(_, h) => {
            if (restoreY.current > 0 && h > restoreY.current) { follow.scrollProps.ref.current?.scrollTo({ y: restoreY.current, animated: false }); restoreY.current = 0; }
          }} scrollIndicatorInsets={{ top: insets.top + NAV_BAR_HEIGHT }} contentContainerStyle={{ paddingTop: insets.top + NAV_BAR_HEIGHT + 6, paddingHorizontal: 22, gap: 24, paddingBottom: 72 }}>
          {/* "Day 1 of 9" with the cross, then the prayer itself, then the mark-as-prayed button.
              In preview (novena not started) the "View Intention" card is hidden, as in the … menu: an intention typed
              there had nowhere to be saved and was silently lost. */}
          <ChapterTitle title={strings.reader.dayOf(dayNo, novena.days.length)} />
          <PrayerPassage blocks={content.blocks} onViewIntention={preview ? undefined : onViewIntention} intention={intentionText} active={active} onBlockLayout={follow.onBlockLayout} />
          {/* Preview: instead of "Mark as prayed", offer to start the novena (then this same day opens for real). */}
          {preview ? (
            <Button label={strings.novena.start} icon="handsPraying" onPress={async () => { const id = await lib.start(novena.id); router.replace(`/reader/${id}/${dayNo}`); }} />
          ) : (
            <View style={{ gap: 10 }}>
              <Button label={alreadyPrayed ? strings.novena.prayedDay(dayNo) : strings.reader.markPrayed(dayNo)} icon="handsPraying" disabled={alreadyPrayed || notYet} onPress={finish} />
              {notYet ? <Text style={[type.bodySmall, { color: colors.text.tertiary, textAlign: 'center' }]}>{strings.reader.notYet(dayNo, notYetWhen)}</Text> : null}
            </View>
          )}
        </ScrollView>
        {/* A soft white fade at the bottom edge so text gently disappears as you scroll (at the top it slides under the glass bar). */}
        <LinearGradient pointerEvents="none" {...gradients.fadeBottom} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46 }} />
      </Reveal>
      {/* The audio player appears here only after the person chooses Listen. It never plays by itself. */}
      <AudioDock inline />

      {/* The … menu: change day, Listen / Read only, save, download, share, view intention. */}
      <ReaderOptionsMenu
        visible={popup === 'menu'}
        day={dayNo}
        total={novena.days.length}
        mode={listening ? 'listen' : 'read'}
        saved={lib.isSaved(novena.id)}
        download={download}
        sizeMb={novena.audioSizeMb}
        hasAudio={novena.hasAudio}
        canListen={novena.hasAudio || PLACEHOLDER_AUDIO}
        onClose={close}
        onChangeDay={(d) => router.setParams({ day: String(d) })}
        onMode={(m) => { if (m === 'listen') audio.open(novena.id, novena.title, dayNo, saved.current?.audioSec ?? 0); else audio.close(); /* the menu stays open; it closes only when you tap outside it */ }}
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
      <PopupCard type="intention-view" visible={popup === 'intention-view'} onClose={close} novenaTitle={novenaPageTitle(novena.title)} value={intentionText} onEdit={() => { setEditFocus(true); setDraft(intentionText); setPopup('intention-edit'); }} />
      {/* "Your Intention" entry card (Figma 985:35382 empty, 985:35418 with text). Closing it or tapping
          "Add Intention" keeps what was written, saved for this novena only. */}
      <PopupCard
        type="intention-edit"
        visible={popup === 'intention-edit'}
        onClose={saveIntentionAndClose}
        novenaTitle={novenaPageTitle(novena.title)}
        value={draft}
        onChange={setDraft}
        focus={editFocus}
        onSave={saveIntentionAndClose}
      />
    </SafeAreaView>
  );
}
