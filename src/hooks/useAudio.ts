// Audio playback. Audio NEVER starts by itself: the player opens paused and the user taps play.
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { audioUrl } from '@/constants/config';
import { usePlayerStore } from '@/state/playerStore';
import { isDownloaded, localAudioPath } from '@/utils/downloads';

export function useAudio() {
  const store = usePlayerStore();
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => () => { playerRef.current?.remove(); playerRef.current = null; }, []);

  const open = async (novenaId: string, title: string, day: number) => {
    playerRef.current?.remove();
    store.load(novenaId, title, day); // state = paused
    const source = (await isDownloaded(novenaId, day)) ? localAudioPath(novenaId, day) : audioUrl(novenaId, day);
    playerRef.current = createAudioPlayer(source);
  };

  return {
    ...store,
    open,
    play: () => { playerRef.current?.play(); store.set({ state: 'playing' }); },
    pause: () => { playerRef.current?.pause(); store.set({ state: 'paused' }); },
    seek: (sec: number) => { playerRef.current?.seekTo(sec); store.set({ positionSec: sec }); },
    close: () => { playerRef.current?.remove(); playerRef.current = null; store.dismiss(); },
  };
}
