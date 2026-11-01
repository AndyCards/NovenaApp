// Audio playback. Audio NEVER starts by itself: the player opens paused and the person taps play.
// There is one player for the whole app, so the Reader and the player card control the same audio.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { audioUrl, PLACEHOLDER_AUDIO } from '@/constants/config';
import { usePlayerStore } from '@/state/playerStore';
import { isDownloaded, localAudioPath } from '@/utils/downloads';

let player: AudioPlayer | null = null;
let openRequest = 0; // each "open" gets a number, so a slower earlier open can't win over a newer one
let audioModeSet = false;

const release = () => { player?.remove(); player = null; };

export function useAudio() {
  const store = usePlayerStore();

  // startAtSec: where to begin (used when coming back to a prayer that was paused part-way). Still opens paused.
  const open = async (novenaId: string, title: string, day: number, startAtSec = 0) => {
    const request = ++openRequest;
    release();
    store.load(novenaId, title, day); // shows the player, paused
    try {
      if (!audioModeSet) {
        // Let prayers be heard even when the iPhone's silent switch is on.
        await setAudioModeAsync({ playsInSilentMode: true });
        audioModeSet = true;
      }
      // While real recordings don't exist, play the bundled placeholder tone (works offline, no network needed).
      const source = PLACEHOLDER_AUDIO ? require('../../assets/audio/placeholder-prayer.mp3')
        : (await isDownloaded(novenaId, day)) ? localAudioPath(novenaId, day) : audioUrl(novenaId, day);
      if (request !== openRequest) return; // a newer open (or close) happened while we waited
      player = createAudioPlayer(source);
      if (startAtSec > 0) { player.seekTo(startAtSec); store.set({ positionSec: startAtSec }); }
      player.addListener('playbackStatusUpdate', (s) => {
        const st = usePlayerStore.getState();
        if (st.state === 'hidden') return;
        // Follow what the phone's player is really doing, so the card never claims "Playing" when it isn't.
        const next = s.didJustFinish ? 'finished'
          : s.playing ? 'playing'
          : st.state === 'playing' && s.isBuffering ? 'loading'
          : st.state === 'loading' && !s.isBuffering ? 'paused'
          : st.state;
        st.set({ positionSec: s.currentTime ?? 0, durationSec: s.duration ?? 0, state: next });
      });
    } catch {
      if (request === openRequest) store.set({ state: 'error' });
    }
  };

  return {
    ...store,
    open,
    play: () => {
      if (!player) return;
      if (usePlayerStore.getState().state === 'finished') player.seekTo(0); // play again from the start
      player.play();
      store.set({ state: 'playing' });
    },
    pause: () => { player?.pause(); store.set({ state: 'paused' }); },
    seek: (sec: number) => { player?.seekTo(sec); store.set({ positionSec: sec }); },
    close: () => { openRequest++; release(); store.dismiss(); },
  };
}
