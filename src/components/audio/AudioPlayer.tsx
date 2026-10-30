// The player bar. States: playing, paused, loading, finished, offline, error. Never autoplays.
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { blur, colors, radius, screenMargin, space, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { PlayerState } from '@/state/playerStore';
import { IconButton } from '../actions/IconButton';
import { Icon } from '../Icon';

type Props = {
  state: Exclude<PlayerState, 'hidden'>;
  title: string;
  positionSec: number;
  durationSec: number;
  layout?: 'full' | 'compact';
  onPlay: () => void;
  onPause: () => void;
  onSeek: (sec: number) => void;
  onClose: () => void;
};

const label = (state: Props['state'], left: string) =>
  state === 'playing' ? `Playing · ${left} left`
  : state === 'paused' ? `Paused · ${left} left`
  : state === 'loading' ? 'Loading…'
  : state === 'finished' ? 'Finished'
  : state === 'offline' ? "Offline · can't stream. Download to listen"
  : "Can't play right now. Read instead";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function AudioPlayer({ state, title, positionSec, durationSec, layout = 'full', onPlay, onPause, onSeek, onClose }: Props) {
  const left = mmss(Math.max(0, durationSec - positionSec));
  const progress = durationSec > 0 ? positionSec / durationSec : 0;
  const playing = state === 'playing';
  const disabled = state === 'offline' || state === 'error' || state === 'loading';
  return (
    <BlurView intensity={blur.glass} tint="light"
      style={{ marginHorizontal: screenMargin, borderRadius: radius.l, overflow: 'hidden', backgroundColor: colors.glass.nowPlayingFill, borderWidth: stroke.hairline, borderColor: colors.glass.nowPlayingBorder }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12], padding: space[12] }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{title}</Text>
          <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.tertiary }]}>{label(state, left)}</Text>
        </View>
        <IconButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} size="large" onPress={disabled ? () => {} : playing ? onPause : onPlay} />
        {layout === 'full' ? <IconButton icon="close" label="Close player" onPress={onClose} /> : null}
      </View>
      {layout === 'full' ? (
        <Pressable accessibilityRole="adjustable" accessibilityLabel="Audio position" style={{ height: 24, justifyContent: 'center', paddingHorizontal: space[12] }}
          onPress={(e) => durationSec > 0 && onSeek((e.nativeEvent.locationX / (e.currentTarget as unknown as { width?: number }).width! || 1) * durationSec)}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.progress.track }}>
            <View style={{ width: `${Math.min(100, progress * 100)}%`, height: 4, borderRadius: 2, backgroundColor: colors.progress.fill }} />
          </View>
        </Pressable>
      ) : null}
    </BlurView>
  );
}
