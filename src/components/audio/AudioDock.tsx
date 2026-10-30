// Holds the player bar above the home indicator. Shows only once audio has been opened.
import { View } from 'react-native';
import { useAudio } from '@/hooks/useAudio';
import { AudioPlayer } from './AudioPlayer';

export function AudioDock({ bottomOffset = 90, layout = 'full' }: { bottomOffset?: number; layout?: 'full' | 'compact' }) {
  const a = useAudio();
  if (a.state === 'hidden') return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: bottomOffset }}>
      <AudioPlayer
        state={a.state}
        title={`${a.novenaTitle} · Day ${a.day}`}
        positionSec={a.positionSec}
        durationSec={a.durationSec}
        layout={layout}
        onPlay={a.play}
        onPause={a.pause}
        onSeek={a.seek}
        onClose={a.close}
      />
    </View>
  );
}
