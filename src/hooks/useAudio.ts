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

// How often the phone reports the playback position. 250ms keeps the follow-along highlight (Reader) within a
// quarter of a second of the voice, without much extra work.
const POSITION_UPDATE_MS = 250;

const store = () => usePlayerStore.getState();

// The player's buttons. These don't change, so a screen can use them without re-drawing every time the
// position moves (the Reader does this, so the prayer text isn't redrawn four times a second).
export const audioControls = {
  open: async (novenaId: string, title: string, day: number) => {
    const request = ++openRequest;
    release();
    store().load(novenaId, title, day); // shows the player, paused
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
      player = createAudioPlayer(source, { updateInterval: POSITION_UPDATE_MS });
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
      if (request === openRequest) store().set({ state: 'error' });
    }
  },
  play: () => {
    if (!player) return;
    if (store().state === 'finished') { player.seekTo(0); store().set({ positionSec: 0 }); } // play again from the start
    player.play();
    store().set({ state: 'playing' });
  },
  pause: () => { player?.pause(); store().set({ state: 'paused' }); },
  seek: (sec: number) => { player?.seekTo(sec); store().set({ positionSec: sec }); },
  close: () => { openRequest++; release(); store().dismiss(); },
};

// For screens that show the player (position, state): re-draws whenever anything about the audio changes.
export function useAudio() {
  const state = usePlayerStore();
  return { ...state, ...audioControls };
}
