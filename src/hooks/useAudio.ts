// Audio playback. Audio NEVER starts by itself: the player opens paused and the user taps play.
// One player for the whole app, so the Reader and the dock control the same audio.
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { audioUrl } from '@/constants/config';
import { usePlayerStore } from '@/state/playerStore';
import { isDownloaded, localAudioPath } from '@/utils/downloads';

let player: AudioPlayer | null = null;

const release = () => { player?.remove(); player = null; };

export function useAudio() {
  const store = usePlayerStore();

  const open = async (novenaId: string, title: string, day: number) => {
    release();
    store.load(novenaId, title, day); // state = paused
    const source = (await isDownloaded(novenaId, day)) ? localAudioPath(novenaId, day) : audioUrl(novenaId, day);
    player = createAudioPlayer(source);
    player.addListener('playbackStatusUpdate', (s) => {
      usePlayerStore.getState().set({
        positionSec: s.currentTime ?? 0,
        durationSec: s.duration ?? 0,
        ...(s.didJustFinish ? { state: 'finished' as const } : null),
      });
    });
  };

  return {
    ...store,
    open,
    play: () => { player?.play(); store.set({ state: 'playing' }); },
    pause: () => { player?.pause(); store.set({ state: 'paused' }); },
    seek: (sec: number) => { player?.seekTo(sec); store.set({ positionSec: sec }); },
    close: () => { release(); store.dismiss(); },
  };
}
