// Reader, Figma Page 34 "Reader · Day 1" (1227:57554) and its menu, intention and pause pop-ups.
// Source Serif 4 is used only on Reader screens. Audio never starts by itself.
// While audio plays, the paragraph being read is highlighted and gently kept in view ("follow-along",
// see useNarrationHighlight and useFollowAlong).
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { AudioDock } from '@/components/audio/AudioDock';
import { PopupCard } from '@/components/overlays/PopupCard';
import { ReaderOptionsMenu } from '@/components/overlays/ReaderOptionsMenu';
import { ChapterTitle } from '@/components/reader/ChapterTitle';
import { PrayerPassage } from '@/components/reader/PrayerPassage';
import { colors } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { getDownload, getIntention, getMeta, setIntention, setMeta } from '@/data/queries';
import { audioControls } from '@/hooks/useAudio';
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
import { NavBar } from '@/components/navigation/NavBar';

export default function Reader() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
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
  const [draft, setDraft] = useState(''); // what is being typed, saved only on "Save intention"
  // Which pop-up is open right now: the … menu, the intention (view or edit), or "Continue another time?".
  const [popup, setPopup] = useState<'none' | 'menu' | 'intention-view' | 'intention-edit' | 'pause'>('none');
  const [download, setDownload] = useState<DownloadStatus>({ kind: 'none' });
  const dayContent = novena?.days.find((d) => d.day === dayNo);
  // Is the player open for this novena? (Decides "Listen" or "Read only" in the … menu.)
  const listening = usePlayerStore((s) => s.state !== 'hidden' && s.novenaId === novena?.id);
  const playing = usePlayerStore((s) => s.state === 'playing' && s.novenaId === novena?.id && s.day === dayNo);
  // Follow-along: which paragraph is being read aloud, and keeping it in view.
  const { activeIndex } = useNarrationHighlight(novena?.id, dayNo, dayContent?.blocks,
    dayContent?.audio?.cues ?? (PLACEHOLDER_AUDIO ? testNarration(novena?.id, dayNo)?.cues : undefined)); // testing voice, Day 1
  const follow = useFollowAlong(activeIndex, playing, `${novena?.id}-${dayNo}`);
  // An unchanging "view intention" handler, so the prayer text isn't re-drawn when this screen re-draws.
  const openIntentionRef = useRef<() => void>(() => {});
  const onViewIntention = useCallback(() => openIntentionRef.current(), []);

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
    if (PLACEHOLDER_AUDIO) audio.open(novena.id, novena.title, dayNo);
  }, [novena?.id, dayNo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!novena || (!run && !preview)) return null;
  const content = dayContent;
  if (!content) return null;
  const alreadyPrayed = !!run?.prayedDays.includes(dayNo);
  // A day that isn't due yet can be read, but not marked as prayed.
  const notYet = !!run && lib.stateOf(run, dayNo) === 'upcoming';
  const close = () => setPopup('none');
  // Going to a later day, the prayer slides in gently from the right; to an earlier day, from the left.
  const slideFrom = lastDay.current === dayNo ? 0 : dayNo > lastDay.current ? 28 : -28;
  lastDay.current = dayNo;

  // "Mark Day N as prayed": save it, refresh, then show the "Day N marked as prayed" screen.
  // A quick double tap only counts once.
  const finish = async () => {
    if (!run || finishing.current) return;
    finishing.current = true;
    try {
      await markPrayed(run.id, dayNo, run.startedOn, run.prayedDays);
      haptics.success(); // one calm double-tap: the day is done
      router.replace(`/prayed/${run.id}/${dayNo}`);
    } finally {
      finishing.current = false;
    }
  };
  // No intention written yet? Open the box to write one. Otherwise show it.
  const openIntention = () => { setEditFocus(false); setDraft(intentionText); setPopup(intentionText.trim() ? 'intention-view' : 'intention-edit'); };
  openIntentionRef.current = openIntention;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.surface.default }}>
      {/* Figma Nav Bar. Back asks "Continue another time?" if today's day isn't marked as prayed yet. … opens the menu. */}
      <NavBar backLabel={strings.common.back} onBack={() => (alreadyPrayed || preview ? router.back() : setPopup('pause'))}
        primaryAction={{ icon: 'more', label: strings.common.more, onPress: () => setPopup('menu') }} />

      <Reveal key={dayNo} slide={false} fromX={slideFrom} style={{ flex: 1 }}>
        <ScrollView {...follow.scrollProps} contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 22, gap: 24, paddingBottom: 72 }}>
          {/* "Day 1 of 9" with the cross, then the prayer itself, then the mark-as-prayed button. */}
          <ChapterTitle title={strings.reader.dayOf(dayNo, novena.days.length)} />
          <PrayerPassage blocks={content.blocks} onViewIntention={onViewIntention} activeIndex={activeIndex} onBlockLayout={follow.onBlockLayout} />
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
        mode={listening ? 'listen' : 'read'}
        saved={lib.isSaved(novena.id)}
        download={download}
        sizeMb={novena.audioSizeMb}
        hasAudio={novena.hasAudio}
        canListen={novena.hasAudio || PLACEHOLDER_AUDIO}
        onClose={close}
        onChangeDay={(d) => router.setParams({ day: String(d) })}
        onMode={(m) => { if (m === 'listen') audio.open(novena.id, novena.title, dayNo); else audio.close(); setTimeout(close, 320); /* let the pill finish sliding before the menu closes */ }}
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
      <PopupCard type="pause" visible={popup === 'pause'} onClose={close} onLeave={() => { close(); router.back(); }} />
      <PopupCard type="intention-view" visible={popup === 'intention-view'} onClose={close} novenaTitle={novenaPageTitle(novena.title)} value={intentionText} onEdit={() => { setEditFocus(true); setDraft(intentionText); setPopup('intention-edit'); }} />
      <PopupCard
        type="intention-edit"
        visible={popup === 'intention-edit'}
        onClose={close}
        novenaTitle={novenaPageTitle(novena.title)}
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
