// Figma "Audio Dock" (1237:63767 / 1323:4714): the player card. Shows only once audio has been opened.
// `inline` puts it in the page flow (Reader, Figma "Audio" 10/8 padding). Otherwise it is a full-width band
// pinned to the bottom: a white fade (Gradient/Audio Dock Fade) so the page softly disappears behind it,
// the player card 10 in from each side, then 4 of space and the phone's bottom safe area (or the tab bar).
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { colors, screenMargin } from '@/constants/theme';
import { useAudio } from '@/hooks/useAudio';
import { useCatalog } from '@/hooks/useCatalog';
import { revealIn } from '@/motion/Reveal';
import { duration } from '@/motion/tokens';
import { AudioPlayer } from './AudioPlayer';

// The player rises in and fades; on close it fades away quickly. (Skipped when Reduce Motion is on.)
const enter = revealIn(0);
const leave = FadeOut.duration(duration.quick).reduceMotion(ReduceMotion.System);
const fade = colors.gradient.audioDockFade;

type Props = { bottomOffset?: number; bottomSpace?: number; layout?: 'full' | 'compact'; inline?: boolean };

export function AudioDock({ bottomOffset = 0, bottomSpace = 4, layout = 'full', inline }: Props) {
  const a = useAudio();
  const { novenaById } = useCatalog();
  const reduced = useReducedMotion();
  if (a.state === 'hidden') return null;
  const novena = a.novenaId ? novenaById(a.novenaId) : undefined;
  const player = (
    <AudioPlayer state={a.state} title={`${a.novenaTitle} · Day ${a.day}`} image={novena?.image} positionSec={a.positionSec} durationSec={a.durationSec}
      layout={layout} onPlay={a.play} onPause={a.pause} onSeek={a.seek} onClose={a.close} />
  );
  if (inline) {
    return (
      <Animated.View entering={reduced ? undefined : enter} exiting={reduced ? undefined : leave} style={{ paddingHorizontal: screenMargin, paddingVertical: 8 }}>
        {player}
      </Animated.View>
    );
  }
  // The animated wrapper is the outermost piece, so the whole band fades away when the player closes.
  return (
    <Animated.View entering={reduced ? undefined : enter} exiting={reduced ? undefined : leave} pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: bottomOffset }}>
      <LinearGradient pointerEvents="none" colors={fade.colors as unknown as [string, string, string]} locations={fade.locations as unknown as [number, number, number]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingHorizontal: screenMargin, paddingBottom: bottomSpace }}>{player}</View>
    </Animated.View>
  );
}
