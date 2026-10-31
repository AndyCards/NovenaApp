// Figma "Audio Player": white card, 44 thumbnail, title + status, round pause/play, scrubber with knob.
// States: playing, paused, loading, finished, offline, error. Never autoplays.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ImageRef } from '@/content/types';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { PlayerState } from '@/state/playerStore';
import { NovenaImage } from '../content/NovenaImage';
import { Icon } from '../Icon';

type Props = {
  state: Exclude<PlayerState, 'hidden'>;
  title: string;
  image?: ImageRef;
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

function RoundButton({ icon, label: a11y, onPress }: { icon: 'play' | 'pause' | 'close'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 0.6, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} />
      </View>
    </Pressable>
  );
}

export function AudioPlayer({ state, title, image, positionSec, durationSec, layout = 'full', onPlay, onPause, onSeek, onClose }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const left = mmss(Math.max(0, durationSec - positionSec));
  const progress = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0;
  const playing = state === 'playing';
  const disabled = state === 'offline' || state === 'error' || state === 'loading';
  const canClose = state === 'paused' || state === 'finished' || state === 'error';
  return (
    <View style={{ borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: colors.surface.default, paddingLeft: 10, paddingRight: 6, paddingVertical: 10, gap: 12,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {image ? <NovenaImage image={image} label="" style={{ width: 44, height: 44, borderRadius: radius.s }} /> : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={[type.labelSmall, { color: colors.text.body }]}>{title}</Text>
          <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.secondary }]}>{label(state, left)}</Text>
        </View>
        {canClose ? <RoundButton icon="close" label="Close player" onPress={onClose} /> : null}
        <RoundButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} onPress={disabled ? () => {} : playing ? onPause : onPlay} />
      </View>
      {layout === 'full' ? (
        <Pressable accessibilityRole="adjustable" accessibilityLabel="Audio position" onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onPress={(e) => durationSec > 0 && trackWidth > 0 && onSeek((e.nativeEvent.locationX / trackWidth) * durationSec)}
          style={{ height: 16, justifyContent: 'center', marginRight: 4 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.progress.track }}>
            <View style={{ width: `${progress * 100}%`, height: 4, borderRadius: 2, backgroundColor: colors.progress.fill }} />
          </View>
          <View style={{ position: 'absolute', left: Math.max(0, progress * trackWidth - 8), width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surface.default, borderWidth: 0.6, borderColor: colors.border.strong,
            shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }} />
        </Pressable>
      ) : null}
    </View>
  );
}
