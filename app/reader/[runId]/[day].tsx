// Reader, Figma Page 34 "Reader · Day 1" (1227:57554) and its menu, intention and pause pop-ups.
// Source Serif 4 is used only on Reader screens. Audio never starts by itself.
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { AudioDock } from '@/components/audio/AudioDock';
import { Icon } from '@/components/Icon';
import { PopupCard } from '@/components/overlays/PopupCard';
import { ReaderOptionsMenu } from '@/components/overlays/ReaderOptionsMenu';
import { ChapterTitle } from '@/components/reader/ChapterTitle';
import { PrayerPassage } from '@/components/reader/PrayerPassage';
import { colors, screenMargin } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { getDownload, getIntention, setIntention } from '@/data/queries';
import { useAudio } from '@/hooks/useAudio';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';
import { markPrayed } from '@/hooks/useMarkPrayed';
import { downloadNovenaAudio, removeDownload } from '@/utils/downloads';
import type { DownloadStatus } from '@/utils/downloadStatus';

function NavButton({ icon, label, onPress }: { icon: 'back' | 'more'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <Icon name={icon} size={22} />
    </Pressable>
  );
}

export default function Reader() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
  const { catalog, novenaById } = useCatalog();
  const lib = useLibrary();
  const audio = useAudio();
  const run = lib.runs.find((r) => r.id === runId);
  const novena = run ? novenaById(run.novenaId) : undefined;
  const dayNo = Number(day);
  const [intentionText, setIntentionText] = useState('');
  // Which pop-up is open right now: the … menu, the intention (view or edit), or "Continue another time?".
  const [popup, setPopup] = useState<'none' | 'menu' | 'intention-view' | 'intention-edit' | 'pause'>('none');
  const [download, setDownload] = useState<DownloadStatus>({ kind: 'none' });

  // Load the person's saved intention, and whether this novena's audio is already downloaded.
  useEffect(() => { if (runId) getIntention(runId).then(setIntentionText); }, [runId]);
  useEffect(() => {
    if (novena) getDownload(novena.id).then((d) => setDownload(d?.status === 'complete' ? { kind: 'done' } : { kind: 'none' }));
  }, [novena?.id]);
  if (!run || !novena) return null;
  const content = novena.days.find((d) => d.day === dayNo);
  if (!content) return null;
  const alreadyPrayed = run.prayedDays.includes(dayNo);
  const close = () => setPopup('none');

  // "Mark Day N as prayed": save it, refresh, then show the "Day N marked as prayed" screen.
  const finish = async () => {
    await markPrayed(run.id, dayNo, run.startedOn, run.prayedDays);
    await lib.refresh();
    router.replace(`/prayed/${run.id}/${dayNo}`);
  };
  // No intention written yet? Open the box to write one. Otherwise show it.
  const openIntention = () => setPopup(intentionText.trim() ? 'intention-view' : 'intention-edit');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.surface.default }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: screenMargin + 2, paddingVertical: 6 }}>
        {/* Back asks "Continue another time?" if today's day isn't marked as prayed yet. … opens the menu. */}
        <NavButton icon="back" label={strings.common.back} onPress={() => (alreadyPrayed ? router.back() : setPopup('pause'))} />
        <NavButton icon="more" label={strings.common.more} onPress={() => setPopup('menu')} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 22, gap: 24, paddingBottom: 72 }}>
          {/* "Day 1 of 9" with the cross, then the prayer itself, then the mark-as-prayed button. */}
          <ChapterTitle title={strings.reader.dayOf(dayNo, novena.days.length)} />
          <PrayerPassage blocks={content.blocks} onViewIntention={openIntention} />
          <Button label={alreadyPrayed ? strings.novena.prayedDay(dayNo) : strings.reader.markPrayed(dayNo)} icon="handsPraying" disabled={alreadyPrayed} onPress={finish} />
        </ScrollView>
        {/* Soft white fades at the top and bottom edges so text gently disappears as you scroll. */}
        <LinearGradient pointerEvents="none" colors={['#FFFFFF', 'rgba(255,255,255,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12 }} />
        <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46 }} />
      </View>
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
        onClose={close}
        onChangeDay={(d) => router.setParams({ day: String(d) })}
        onMode={(m) => { if (m === 'listen') audio.open(novena.id, novena.title, dayNo); else audio.close(); close(); }}
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
      />
      <PopupCard type="pause" visible={popup === 'pause'} onClose={close} onLeave={() => { close(); router.back(); }} />
      <PopupCard type="intention-view" visible={popup === 'intention-view'} onClose={close} novenaTitle={`${novena.title} Novena`} value={intentionText} onEdit={() => setPopup('intention-edit')} />
      <PopupCard
        type="intention-edit"
        visible={popup === 'intention-edit'}
        onClose={close}
        novenaTitle={`${novena.title} Novena`}
        value={intentionText}
        onChange={setIntentionText}
        // The intention stays on this phone. It is never uploaded or shared.
        onSave={async () => { await setIntention(run.id, intentionText.trim()); setPopup(intentionText.trim() ? 'intention-view' : 'none'); }}
      />
    </SafeAreaView>
  );
}
