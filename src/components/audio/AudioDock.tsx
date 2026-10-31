// Holds the player card. Shows only once audio has been opened. `inline` puts it in the page flow
// (Reader, Figma "Audio" 10/8 padding); otherwise it floats above the tab bar.
import Animated, { FadeOut, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { screenMargin } from '@/constants/theme';
import { useAudio } from '@/hooks/useAudio';
import { useCatalog } from '@/hooks/useCatalog';
import { revealIn } from '@/motion/Reveal';
import { duration } from '@/motion/tokens';
import { AudioPlayer } from './AudioPlayer';

// The player rises in and fades; on close it fades away quickly. (Skipped when Reduce Motion is on.)
const enter = revealIn(0);
const leave = FadeOut.duration(duration.quick).reduceMotion(ReduceMotion.System);

type Props = { bottomOffset?: number; layout?: 'full' | 'compact'; inline?: boolean };

export function AudioDock({ bottomOffset = 90, layout = 'full', inline }: Props) {
  const a = useAudio();
  const { novenaById } = useCatalog();
  const reduced = useReducedMotion();
  if (a.state === 'hidden') return null;
  const novena = a.novenaId ? novenaById(a.novenaId) : undefined;
  // The animated wrapper is the outermost piece, so it is the thing that fades away when the player closes.
  const place = inline
    ? { paddingHorizontal: screenMargin, paddingVertical: 8 }
    : { position: 'absolute' as const, left: screenMargin, right: screenMargin, bottom: bottomOffset };
  return (
    <Animated.View entering={reduced ? undefined : enter} exiting={reduced ? undefined : leave} pointerEvents={inline ? 'auto' : 'box-none'} style={place}>
      <AudioPlayer state={a.state} title={`${a.novenaTitle} · Day ${a.day}`} image={novena?.image} positionSec={a.positionSec} durationSec={a.durationSec}
        layout={layout} onPlay={a.play} onPause={a.pause} onSeek={a.seek} onClose={a.close} />
    </Animated.View>
  );
}
