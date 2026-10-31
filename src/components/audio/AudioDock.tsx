// Holds the player card. Shows only once audio has been opened. `inline` puts it in the page flow
// (Reader, Figma "Audio" 10/8 padding); otherwise it floats above the tab bar.
import { View } from 'react-native';
import { screenMargin } from '@/constants/theme';
import { useAudio } from '@/hooks/useAudio';
import { useCatalog } from '@/hooks/useCatalog';
import { AudioPlayer } from './AudioPlayer';

type Props = { bottomOffset?: number; layout?: 'full' | 'compact'; inline?: boolean };

export function AudioDock({ bottomOffset = 90, layout = 'full', inline }: Props) {
  const a = useAudio();
  const { novenaById } = useCatalog();
  if (a.state === 'hidden') return null;
  const novena = a.novenaId ? novenaById(a.novenaId) : undefined;
  const player = (
    <AudioPlayer state={a.state} title={`${a.novenaTitle} · Day ${a.day}`} image={novena?.image} positionSec={a.positionSec} durationSec={a.durationSec}
      layout={layout} onPlay={a.play} onPause={a.pause} onSeek={a.seek} onClose={a.close} />
  );
  if (inline) return <View style={{ paddingHorizontal: screenMargin, paddingVertical: 8 }}>{player}</View>;
  return <View pointerEvents="box-none" style={{ position: 'absolute', left: screenMargin, right: screenMargin, bottom: bottomOffset }}>{player}</View>;
}
